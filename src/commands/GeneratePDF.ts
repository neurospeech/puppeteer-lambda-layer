import { IEvent } from "../IEvent";
import Command from "./Command";

export default class GeneratePDF extends Command {
    async render({ outputFile: path, page, output, pdf }: IEvent) {
        
        const pf = typeof pdf === "object"
            ? { ... pdf, path}
            : { path };

        await page.pdf(pf);

        return output;
    }

}
