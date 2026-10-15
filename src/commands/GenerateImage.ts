import { IEvent } from "../IEvent.js";
// import TempFileService from "../TempFileService";
import Command from "./Command.js";

export default class GenerateImage extends Command {
    async render({ page, outputFile: path, output, quality = 95 }: IEvent) {

        console.log(`Saving screenshot to ${path}`);
        if (path.endsWith(".png")) {
            await page.screenshot({ path });
        } else {
            await page.screenshot({ path, quality });
        }

        return output;
    }

}
