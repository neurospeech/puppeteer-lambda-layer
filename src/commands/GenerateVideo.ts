import { IEvent } from "../IEvent.js";
import VideoRecorder from "../VideoRecorder.js";
import Command from "./Command.js";

export default class GenerateVideo extends Command {

    async render({ video, page, outputFile: filePath}: IEvent) {
        const recorder = new VideoRecorder(page, video, filePath);
        await recorder.record();
        return filePath;
    }

}
