import fetch from "node-fetch";
import { Page } from "puppeteer-core";
import BaseCommand from "../BaseCommand";
import BotChecker from "../BotChecker";
import TempFileService from "../TempFileService";

export default class FetchPreview extends BaseCommand {


    async save(event) {
        const params = event;

        const {
            botUserAgent,
            url
        } = params;

        const { canCrawl , content } = await BotChecker.check(url, botUserAgent);
        delete params.url;
        params.content = content;
        // disable all resources...
        params.html = true;
        if (!canCrawl) {
            console.log("Bot denied succeeded");
        } else {
            console.log("Bot check succeeded");
        }

        return await this.onSave(params);
    }

    protected onBeforeRender() {
        return Promise.resolve();
    }

    protected async onRender({ output }) {
        let document: any;
        let url = await this.page.evaluate(() => document.head.querySelector(`meta[property="og:image"]`)?.content);
        if (url) {
            url = await this.page.evaluate(() => document.head.querySelector(`img`)?.src);
        }

        const file = await TempFileService.getTempFile(".jpg");
        await TempFileService.fetch(url, file.path);

        await this.upload({ url: output , filePath: file.path});

        return {
            statusCode: 200,
            body: JSON.stringify(url),
            headers: {
                "content-type": "application/json"
            }
        };
    }
    
}