import { file } from "tmp-promise";
import fetch from "node-fetch";
import * as tmp from "tmp";
import { createWriteStream, promises as fsp } from "fs";

tmp.setGracefulCleanup();


export default class TempFileService {

    public static getTempFile(ext: string = ".tmp") {
        return file({ mode: 0o644, prefix: "tmp-" , postfix: ext});
    }

    
    public static async fetch(inputUrl: string, filePath: string = null) {
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
