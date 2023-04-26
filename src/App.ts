import { BlobSASPermissions, BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import Command from "./commands/Command";
import FetchPreview from "./commands/FetchPreview";
import GenerateImage from "./commands/GenerateImage";
import GeneratePDF from "./commands/GeneratePDF";
import GenerateVideo from "./commands/GenerateVideo";
import { IEvent } from "./IEvent";
import GenerateHtml from "./commands/GenerateHtml";

const asNumber = (n) => typeof n === "number" ? n : parseInt(n, 10);

const asBoolean = (n) => typeof n === "boolean" ? n : (typeof n === "string" ? /true|yes/i.test(n) : false);

const asJson = (n) => typeof n === "string" ? JSON.parse(n) : (typeof n === "object" ? n : null);


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
    pdf: asJson,
    botCheck: asBoolean,
    video: asJson
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

        event = format(event.queryStringParameters ?? event.body ?? {}) as queryParameters;

        await generateTempFile(event);

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

async function generateTempFile(event: IEvent) {

    let ext = ".jpg";
    if (event.html) {
        ext = ".html";
    } else if(event.video) {
        ext = ".mp4";
    } else if(event.pdf) {
        ext = ".pdf";
    }

    event.outputExt ||= ext;

    const {
        timeout = 15000,
        mobile = true,
        height = mobile ? 800 : 900,
        width = mobile ? 400 : 1024,
        deviceScaleFactor = mobile ? 2: 1,
        pdf = null,
        html = null,
        stopTest = "window.pageReady",
    } = event;

    event.mobile = mobile;
    event.height = height;
    event.width = width;
    event.deviceScaleFactor = deviceScaleFactor;
    event.pdf = pdf;
    event.html = html;
    event.stopTest = stopTest;
    event.timeout = timeout;

    if (event.output) {
        return;
    }

    if (event.html) {
        return;
    }

    const key = process.env.azure_blob_storage_connection;
    const bc = BlobServiceClient.fromConnectionString(key);
    const tc = bc.getContainerClient("tmp");
    const b = tc.getBlobClient("pg/" + Date.now() + "-" + Date.now() + "/file" + ext);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    event.output = await b.generateSasUrl({
        permissions: BlobSASPermissions.from({ read: true, write: true }),
        expiresOn: tomorrow
    });
}

