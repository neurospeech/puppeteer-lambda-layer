import Command from "./Command";
import BotChecker from "../BotChecker";
import TempFileService from "../TempFileService";
import cheerio from "cheerio";
import { IEvent } from "../IEvent";

export default class FetchPreview extends Command {

    save(event: IEvent): Promise<string> {
        throw new Error("Method not implemented.");
    }
    render(event: IEvent): Promise<any> {
        throw new Error("Method not implemented.");
    }


    async run(event) {
        const params = event;

        const {
            botCheck,
            botUserAgent,
            output,
        } = params;

        const { canCrawl , content } = await BotChecker.check(params.url, botUserAgent, botCheck);
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

        if (!url) {
            // we might need to process html using JSDOM
            console.log(`URL not found in`);
            console.log(content);
        }

        let title = $(`head > title`).text();

        let description = $(`meta[name=description]`).attr("content") || $(`meta[property=og\\:description]`).attr("content");

        const file = await TempFileService.getTempFile(".jpg");
        await TempFileService.fetch(url, file.path);

        await this.upload({ url: output , filePath: file.path});

        return {
                url,
                title,
                description
            };
    }

    dispose(): Promise<void> {
        return Promise.resolve();
    }
    
}