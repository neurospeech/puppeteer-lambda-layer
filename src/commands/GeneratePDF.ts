import { IEvent } from "../IEvent";
import Command from "./Command";

let document: any;

function updatePageSize() {
    const maxHeight =  Array.from<any>(document.all).reduce((a, c) => Math.max(c.scrollHeight , a) , 0);
    document.body.style.height = `${maxHeight}px`;
    document.body.style.overflow = "auto";
}

export default class GeneratePDF extends Command {
    async render({ outputFile: path, page, output, pdf }: IEvent) {

        await page.evaluate(updatePageSize);
        
        const pf = typeof pdf === "object"
            ? { ... pdf, path}
            : { path };

        pf.format ??= "A4";

        await page.pdf(pf);

        return output;
    }

}
