import { IEvent } from "../IEvent";
import Command from "./Command";

let document: any;

function getMaxPageSize() {
    return Array.from<any>(document.all).reduce((a, c) => Math.max(c.scrollHeight , a) , 0);
}

export default class GeneratePDF extends Command {
    async render({ outputFile: path, page, output, pdf }: IEvent) {

        const height = await page.evaluate(getMaxPageSize);

        const {
            width,
            isMobile,
            deviceScaleFactor,
            hasTouch,
            isLandscape
        } = page.viewport();

        await page.setViewport({
            width,
            height,
            isMobile,
            deviceScaleFactor,
            hasTouch,
            isLandscape
        });
        
        await page.emulateMediaType("screen");
        
        const pf = typeof pdf === "object"
            ? { ... pdf, path}
            : { path };

        pf.format ??= "A4";

        await page.pdf(pf);

        return output;
    }

}
