import { IEvent } from "../IEvent.js";
import Command from "./Command.js";

export default class GeneratePDF extends Command {
    async render({ outputFile: path, page, output, pdf }: IEvent) {

        const pf = typeof pdf === "object"
            ? { ... pdf, path}
            : { path };

        pf.format ??= "A4";

        await page.pdf(pf);

        return output;
    }

}
