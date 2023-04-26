import { readFileSync, readdirSync, existsSync, promises } from "fs";
import puppeteer, { Browser, Page } from "puppeteer-core";
import { join } from "path";
import * as mime from "mime-types";
import { BlockBlobClient } from "@azure/storage-blob";

// tslint:disable-next-line: max-line-length
const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1 Mobile-Preview/1.1";

const executablePath = (() => {
    const root = join(__dirname, "..", "..", "puppeteer-chromium", "chrome");
    // get first folder...
    const first = readdirSync(root)[0];
    const winPath = join(root, first, "chrome-win", "chrome.exe");
    if (existsSync(winPath)) {
        return winPath;
    }
    return join(root, first, "chrome-linux", "chrome");
})();

// const executablePath = "/usr/bin/chromium";

const sleep = (n) => new Promise((resolve, reject) => {
    if (typeof n !== "number") {
        n = parseInt(n, 10);
    }
    setTimeout(resolve, (n));
});

const options = [
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--disk-cache-size=33554432',
    // '--hide-scrollbars',
    // '--ignore-gpu-blacklist',
    // '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
    '--single-process',
    // '--enable-logging=stderr',
    // '--v=1',
    // '--disable-gpu',
    //   '--window-size=400,800',
];

export interface ICommandInput {
    url: string;
    filePath: string;
}

import { IEvent } from "../IEvent";
import TempFileService from "../TempFileService";

export default abstract class Command {

    public async run(event: IEvent): Promise<any> {
        await this.init(event);
        await this.generateTempFile(event);
        await this.render(event);
        await this.uploadFile(event);
        return event.result ?? { output: event.output};
    }
    
    async uploadFile({ outputFile: filePath , output: url}: IEvent) {
        if (filePath && url) {
            await this.upload({ filePath, url })
        }
    }

    abstract render(event: IEvent): Promise<any>;

    async dispose({ browser }: IEvent) {
        try {
            await browser.close();
        } catch (ex) {
            console.log(ex);
        }
    }

    async generateTempFile(event: IEvent) {
        if (event.outputExt && !event.outputFile) {
            event.outputFile = (await TempFileService.getTempFile(event.outputExt)).path;
        }
    }

    async init(event: IEvent) {
        const {
            url,
            content,
            timeout = 15000,
            mobile = true,
            height = mobile ? 800 : 900,
            width = mobile ? 400 : 1024,
            deviceScaleFactor = mobile ? 2: 1,
            pdf = null,
            html = null,
            stopTest = "window.pageReady",
            output,
            video,
        } = event;

        if (url) {
            console.log(`Received URL: ${url}`);
        } else if (content) {
            console.log(`Setting content ${content.split("\n")[0]} ... `);
        } else {
            throw new Error("No url or content specified");
        }

        const browser = await puppeteer.launch({
            executablePath,
            userDataDir: "/tmp",
            // dumpio: true,
            args: video ? [ ... options, "--autoplay-policy=no-user-gesture-required"] : options,
            ignoreDefaultArgs: video ? ["--mute-audio"] : false
        });

        console.log(`Puppeteer Launched.`);

        let page = await browser.newPage();

        console.log(`New Page created.`);

        if (mobile) {
            console.log(`User agent set.`);
            await page.setUserAgent(userAgent);
        }
        const screenSize = {
            width,
            height,
            deviceScaleFactor
        };
        await page.setViewport(screenSize);
        console.log(`Screen Size set. ${JSON.stringify(screenSize)}`);

        event.browser = browser;
        event.page = page;

        // if it is html...
        // disable image/css/font/video...
        await this.interceptResourceLoader(event);

        if (url) {
            await page.goto(url, { waitUntil: "networkidle2" });
            console.log(`Url loaded.`);
        } else {
            await page.setContent(content, { waitUntil: "networkidle2"});
            console.log(`Content loaded.`);
        }

        await this.waitForPageToLoad(event);
    }

    async waitForPageToLoad({ timeout, page, stopTest }: IEvent) {
        console.log(`Waiting for pageReady`);
        let start = Date.now();
        let end = start + timeout;
        for (let index = start; index < end; index += 1000) {
            await sleep(1000);
            if (await page.evaluate(stopTest)) {
                console.log(`Page is ready`);
                await sleep(1000);
                break;
            }
        }

        await page.waitForNetworkIdle({
            timeout: 3000
        });
    }


    async interceptResourceLoader({ html, page}: IEvent) {
    }

    protected async upload(x: ICommandInput) {
        if (!existsSync(x.filePath)) {
            console.log(`File ${x.filePath} does not exist.`);
            return;
        }
        if (!x.url) {
            console.log(`Cannot upload ${x.filePath} as upload url is empty.`);
            return;
        }
        if (x.url.includes(".blob.core.windows.net")) {
            // use put...
            return this.uploadAzure(x);
        }
        console.log(`File ${x.url} not supported for upload.`);
    }

    protected async uploadAzure({url, filePath}: ICommandInput) {
        console.log(`Uploading ${url}`);

        const blobContentType = mime.lookup(filePath);

        var b = new BlockBlobClient(url);
        await b.uploadFile(filePath, {
            blobHTTPHeaders: {
                blobContentType,
                blobCacheControl: "public, max-age=3240000"
            }
        });
        try {
            await promises.unlink(filePath);
        } catch {
            // do nothing...
        }

    }
}
