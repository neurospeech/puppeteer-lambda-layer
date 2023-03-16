import TempFileService from "./TempFileService";
import { readFileSync, readdirSync, existsSync, promises } from "fs";
import puppeteer, { Browser, Page } from "puppeteer-core";
import { join } from "path";
import * as mime from "mime-types";
import { BlockBlobClient } from "@azure/storage-blob";
import BotChecker from "./BotChecker";
import VideoRecorder from "./VideoRecorder";

// tslint:disable-next-line: max-line-length
const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1";

const executablePath = (() => {
    const root = join(__dirname, "..", "puppeteer-chromium", "chrome");
    // get first folder...
    const first = readdirSync(root)[0];
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

export default class BaseCommand {

    private browser: Browser;
    protected page: Page;

    constructor(private event) {

    }

    async save(event) {
        return await this.onSave(event);
    }

    protected async onSave(event) {

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

        const { page } = await this.createPage({
            mobile,
            width,
            height,
            deviceScaleFactor,
            html,
            video
        });

        if (url) {
            await page.goto(url, { waitUntil: "networkidle2" });
            console.log(`Url loaded.`);
        } else {
            await page.setContent(content, { waitUntil: "networkidle2"});
            console.log(`Content loaded.`);
        }

        await this.onBeforeRender(timeout, page, stopTest);

        return await this.onRender({ html, pdf, video, output});
    }

    protected async onRender({ html, pdf, video, output}) {
        const page = this.page;
        if (html) {

            const text = await page.evaluate("window.document.documentElement.outerHTML");
            return {
                statusCode: 200,
                headers: {
                    "content-type": "text/html"
                },
                body: text
            };
        }

        console.log(`Taking screenshot.`);

        if (output) {
            const filePath = await this.saveOutput(pdf, video, output);
            await this.upload({ filePath, url: output });
            return {
                statusCode: 200,
                headers: {},
                body: {
                    output
                }
            };    
        }

        const screen = pdf
            ? await page.pdf(pdf) as Buffer
            : await page.screenshot() as Buffer;

        console.log(`Sending screenshot.`);
        const body = screen.toString("base64");

        return {
            statusCode: 200,
            headers: {
                "content-type": pdf ? "application/pdf" : "image/png"
            },
            body,
            isBase64Encoded: true
        };

    }

    protected async onBeforeRender(timeout: number, page: Page, stopTest: any) {
        let start = Date.now();
        let end = start + timeout;
        for (let index = start; index < end; index += 1000) {
            await sleep(1000);
            if (await page.evaluate(stopTest)) {
                break;
            }
        }
    }

    protected async saveOutput(pdf: any, video: any, output: any) {
        const page = this.page;
        const filePath = (await TempFileService.getTempFile(
                pdf
                    ? ".pdf"
                    : (video
                            ? ".mp4"
                            : ".jpg"))).path;
        if (pdf) {
            pdf.path = filePath;
            await page.pdf(pdf);
            return filePath;
        } 

        // video recorder....
        if (!video) {
            await page.screenshot({ path: filePath });
            return filePath;
        }

        const recorder = new VideoRecorder(page, video, filePath);
        await recorder.record();
        return filePath;
    }

    async dispose() {
        try {
            await this.browser.close();
        } catch (ex) {
            console.log(ex);
        }
    }


    private async createPage({
        mobile,
        width,
        height,
        deviceScaleFactor,
        html,
        video
    }) {
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
        await page.setViewport({
            width,
            height,
            deviceScaleFactor
        });
        console.log(`Screen Size set.`);

        // if it is html...
        // disable image/css/font/video...

        if (html) {
            await page.setRequestInterception(true);
            page.on("request", (req) => {
                if(/stylesheet|image|font|media|websocket/.test(req.resourceType())) {
                    req.abort();
                    return;
                }
                req.continue();
            });
        }
        this.browser = browser;
        this.page = page;
        return { page, browser };
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
