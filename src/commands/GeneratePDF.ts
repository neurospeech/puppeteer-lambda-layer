import { IEvent } from "../IEvent";
import Command from "./Command";

let document: any;

function getMaxHeight() {
    return Array.from<any>(document.all).reduce((a, c) => Math.max(c.scrollHeight , a) , 0);
}

export default class GeneratePDF extends Command {
    async render({ outputFile: path, page, output, pdf }: IEvent) {

        // find div with maximum scroll height
        const maxHeight = await page.evaluate(getMaxHeight);
        
        const pf = typeof pdf === "object"
            ? { ... pdf, path}
            : { path };

        pf.format ??= "A4";
        pf.height = maxHeight + "px";

        await page.pdf(pf);

        return output;
    }

}
