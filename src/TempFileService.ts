import { file } from "tmp-promise";
import * as tmp from "tmp";
import { promises as fsp } from "fs";

tmp.setGracefulCleanup();

declare var fetch: any;


export default class TempFileService {

    public static getTempFile(ext: string = ".tmp") {
        return file({ mode: 0o644, prefix: "tmp-" , postfix: ext});
    }

    
    public static async fetch(inputUrl: string, filePath: string = null) {

        console.log(`Downloading ${inputUrl}`);

        const rs = await fetch(inputUrl);
        if (rs.status >= 300) {
            // error...
            throw new Error(`Download ${inputUrl} failed \r\n${await rs.text()}`);
        }

        await fsp.writeFile(filePath, rs.body);

        console.log(`File ${inputUrl} downloaded to ${filePath}`);

        return filePath;
    }

}
