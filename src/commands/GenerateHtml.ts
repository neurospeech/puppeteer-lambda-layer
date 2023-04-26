import { writeFileSync } from "fs";
import { IEvent } from "../IEvent";
import Command from "./Command";
import FlattenStyles from "./html/FlattenStyles";

export default class GenerateHtml extends Command {

    async render(event: IEvent) {
        const {page, outputFile, flattenStyle} = event;

        if(flattenStyle) {
            await page.evaluate(FlattenStyles);
        }

        const { html } = event;

        const text = html === "body"
            ? await page.evaluate("window.document.body.innerHTML") as string
            : await page.evaluate("window.document.documentElement.outerHTML") as string;
        if (outputFile) {
            console.log(`Saving html to ${outputFile}`);
            writeFileSync(outputFile, text , "utf-8");        
        } else {
            console.log(`Setting result ${text}`);
            event.result = text;
        }
    }

    async generateTempFile(event: IEvent): Promise<void> {
        if(event.output) {
            await super.generateTempFile(event);
        }
    }

    async interceptResourceLoader({ page, flattenStyle }: IEvent) {
        await page.setRequestInterception(true);
        if (flattenStyle) {
            page.on("request", (req) => {
                if (/image|font|media|websocket/.test(req.resourceType())) {
                    req.abort();
                    return;
                }
                req.continue();
            });
            return;
        }
        page.on("request", (req) => {
            if (/stylesheet|image|font|media|websocket/.test(req.resourceType())) {
                req.abort();
                return;
            }
            req.continue();
        });
    }

}