import fetch from "node-fetch";
import { Page } from "puppeteer-core";
import BaseCommand from "../BaseCommand";
import BotChecker from "../BotChecker";
import TempFileService from "../TempFileService";
import cheerio from "cheerio";

export default class FetchPreview extends BaseCommand {


    async save(event) {
        const params = event;

        const {
            botUserAgent,
            output,
        } = params;

        const { canCrawl , content } = await BotChecker.check(params.url, botUserAgent);
        delete params.url;
        params.content = content;
        // disable all resources...
        params.html = true;
        if (!canCrawl) {
            console.log("Bot denied succeeded");
        } else {
            console.log("Bot check succeeded");
        }

        const $ = cheerio.load(content);

        let url = $(`meta[property=og\\:image]`).attr("content");
        if (!url) {
            url = $(`img`).attr("src");
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

    dispose(): Promise<void> {
        return Promise.resolve();
    }
    
}