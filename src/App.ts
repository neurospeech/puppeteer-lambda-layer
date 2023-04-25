import { BlobSASPermissions, BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import BaseCommand from "./BaseCommand";
import Command from "./commands/Command";
import FetchPreview from "./commands/FetchPreview";
import GenerateImage from "./commands/GenerateImage";
import GeneratePDF from "./commands/GeneratePDF";
import GenerateVideo from "./commands/GenerateVideo";
import { IEvent } from "./IEvent";
import { parse } from "path";
import GenerateHtml from "./commands/GenerateHtml";
// import SaveUrl from "./SaveUrl";

const asNumber = (n) => typeof n === "number" ? n : parseInt(n, 10);

const asBoolean = (n) => typeof n === "boolean" ? n : (typeof n === "string" ? /true|yes/i.test(n) : false);

const asJson = (n) => typeof n === "string" ? JSON.parse(n) : null;


interface queryParameters {
    url?: string;
    content?: string;
    timeout?: number | string;
    mobile?: string | boolean;
    height?: number | string;
    width?: number | string;
    deviceScaleFactor?: number | string;
    pdf?: any;
    video?: any;
    html?: string | boolean;
    stopTest?: string;
    output?: string;
    botCheck?: string | boolean;
    botUserAgent?: string;
};

const queryParametersTranslator = {
    timeout: asNumber,
    mobile: asBoolean,
    height: asNumber,
    width: asNumber,
    deviceScaleFactor: asNumber,
    html: asBoolean,
    pdf: asJson,
    botCheck: asBoolean
};

function format(e: queryParameters): queryParameters {
    for (const key in queryParametersTranslator) {
        if (Object.prototype.hasOwnProperty.call(queryParametersTranslator, key)) {
            const element = queryParametersTranslator[key];
            const v = e[key];
            if (v !== void 0) {
                e[key] = element(v);
            }
        }
    }
    return e;
};


export default class App {

    public static async save(event) {

        event.output ??= await generateTempFile(event);

        event.outputExt = parse(event.output).ext;

        event = format(event.queryStringParameters ?? event.body ?? {}) as queryParameters;

        if (event.botCheck) {
            return this.run(new FetchPreview(), event);
        }

        if(event.video) {
            return this.run(new GenerateVideo(), event);
        }

        if(event.pdf) {
            return this.run(new GeneratePDF(), event);
        }

        if(event.html) {
            return this.run(new GenerateHtml(), event);
        }

        return this.run(new GenerateImage(), event);
    }

    public static async run(instance: Command, event) {
        try {
            const r = await instance.run(event);
            return {
                body: JSON.stringify(r),
                headers: {
                    "content-type": "application/json"
                }
            };
        } catch (e) {
            console.error(e);
            return {
                statusCode: 500,
                body: e.stack ?? e.toString()
            }
        } finally {
            await instance.dispose(event);
        }

    }
}

async function generateTempFile(event: IEvent): Promise<any> {
    const key = process.env.azure_blob_storage_connection;
    const bc = BlobServiceClient.fromConnectionString(key);
    const tc = bc.getContainerClient("tmp");

    let ext = ".jpg";
    if (event.html) {
        ext = ".html";
    } else if(event.video) {
        ext = ".mp4";
    } else if(event.pdf) {
        ext = ".pdf";
    }

    const b = tc.getBlobClient("pg/" + Date.now() + "-" + Date.now() + "/file" + ext);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await b.generateSasUrl({
        permissions: BlobSASPermissions.from({ read: true, write: true }),
        expiresOn: tomorrow
    });
}

