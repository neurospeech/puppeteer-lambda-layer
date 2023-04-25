import { writeFileSync } from "fs";
import { IEvent } from "../IEvent";
import Command from "./Command";

export default class GenerateHtml extends Command {

    async render({ page, outputFile }: IEvent) {
        const text = await page.evaluate("window.document.documentElement.outerHTML") as string;
        writeFileSync(outputFile, text , "utf-8");        
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
