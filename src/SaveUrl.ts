import TempFileService from "./TempFileService";
import { readFileSync, readdirSync } from "fs";
import puppeteer from "puppeteer-core";
import { join } from "path";

// tslint:disable-next-line: max-line-length
const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1";

// const executablePath = (() => {
//     const root = join(__dirname, "..", "node_modules", "puppeteer-chromium", "chrome");
//     // get first folder...
//     const first = readdirSync(root)[0];
//     return join(root, first, "chrome-linux", "chrome");
// })();

const executablePath = "/usr/bin/chromium-browser";

const sleep = (n) => new Promise((resolve, reject) => {
    if (typeof n !== "number") {
        n = parseInt(n, 10);
    }
    setTimeout(() => {
        resolve;
    }, (n));
});

export default class SaveUrl {

    public static async save(event) {
        const { queryStringParameters: {
            url,
            html,
            timeout = 2000,
            height = 800,
            width = 320,
            killEvent = "kill"
        } = {} as any } = event;

        const file = await TempFileService.getTempFile("a.png");

        const browser = await puppeteer.launch({
            executablePath,
            headless: false,
            userDataDir: "/tmp",
            dumpio: true,
            args: ['--autoplay-policy=user-gesture-required',
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
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
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
        '--enable-logging=stderr',
        '--v=1',
        '--disable-gpu']});
        let page = await browser.newPage();
        page.setUserAgent(userAgent);
        page.setViewport({ width, height });

        await page.goto(url);

        await sleep(timeout);

        await page.screenshot({ path: file.path });

        await browser.close();

        const body = readFileSync(file.path, "base64");

        return {
            statusCode: 200,
            headers: {
                "content-type": "image/png"
            },
            body,
            isBase64Encoded: true
        };

    }

}
