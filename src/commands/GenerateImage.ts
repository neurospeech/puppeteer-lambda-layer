import { IEvent } from "../IEvent";
import TempFileService from "../TempFileService";
import Command from "./Command";

export default class GenerateImage extends Command {
    async render({ page, outputFile: path, output }: IEvent) {

        console.log(`Saving screenshot to ${path}`);
        await page.screenshot({ path });

        return output;
    }

}
