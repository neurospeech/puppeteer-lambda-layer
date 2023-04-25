import { IEvent } from "../IEvent";
import VideoRecorder from "../VideoRecorder";
import Command from "./Command";

export default class GenerateVideo extends Command {

    async render({ video, page, outputFile: filePath}: IEvent) {
        const recorder = new VideoRecorder(page, video, filePath);
        await recorder.record();
        return filePath;
    }

}
