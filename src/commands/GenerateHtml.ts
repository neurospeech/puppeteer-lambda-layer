import { writeFileSync } from "fs";
import { IEvent } from "../IEvent";
import Command from "./Command";

export default class GenerateHtml extends Command {

    async render(event: IEvent) {
        const {page, outputFile } = event;
        const text = await page.evaluate("window.document.documentElement.outerHTML") as string;
        if (outputFile) {
            console.log(`Saving html to ${outputFile}`);
            writeFileSync(outputFile, text , "utf-8");        
        } else {
            console.log(`Setting result ${text}`);
            event.result = text;
        }
    }

    async interceptResourceLoader({ html, page}: IEvent) {
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (/stylesheet|image|font|media|websocket/.test(req.resourceType())) {
                req.abort();
                return;
            }
            req.continue();
        });
    }

}
