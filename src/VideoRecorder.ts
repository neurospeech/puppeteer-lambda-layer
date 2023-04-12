import { join } from "path";
import { Page } from "puppeteer-core";
import { PuppeteerScreenRecorder } from "puppeteer-screen-recorder";

declare var window: any;
declare var document: any;
declare var CustomEvent: any;

export default class VideoRecorder {
    recorder: PuppeteerScreenRecorder;

    constructor(
        private page: Page,
        private video: any,
        private filePath: string) {
    }

    public async record() {

        await this.init();

        console.log(`Waiting for start recording`);
        await this.page.exposeFunction("startRecording", async () => {
            await this.recorder.start(this.filePath);
            await this.page.evaluate(() => {
                const ce = new CustomEvent("recordingBegan", { bubbles: true, cancelable: true});
                document.body.dispatchEvent(ce);    
            });
            console.log(`Recording started`);
        });
        await this.page.evaluate(() => {
            const ce = new CustomEvent("beginRecording", { bubbles: true, cancelable: true});
            document.body.dispatchEvent(ce);
            if (ce.defaultPrevented) {
                return;
            }
            window.startRecording();
        });
        return new Promise<void>((resolve, reject) => {
            this.page.exposeFunction("stopRecording", async () => {
                await this.recorder.stop();
                console.log(`Recording stopped`);
                resolve();
            }).catch(reject);
        });
    }
    
    private async init() {
        const viewPort = this.page.viewport();
        this.recorder = new PuppeteerScreenRecorder(this.page as any, {
            fps: 25,
            ffmpeg_Path: join(__dirname, "..",  "ffmpeg", "ffmpeg"),
            videoFrame: {
                width: viewPort.width,
                height: viewPort.height,
            },
            videoCrf: 18,
            videoCodec: 'libx264',
            videoPreset: 'ultrafast',
            videoBitrate: 1000,
            autopad: {
                // eslint-disable-next-line no-bitwise
                color: "#35A5FF",
            },

            ... this.video
        });

    }

}