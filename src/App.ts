import FetchPreview from "./commands/FetchPreview";
import SaveUrl from "./SaveUrl";

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

        event = format(event.queryStringParameters ?? event.body ?? {}) as queryParameters;

        const instance = event.botCheck
            ? new FetchPreview(event)
            : new SaveUrl(event);

        try {
            const r = await instance.save(event);
            if (typeof r.body === "object") {
                (r.headers ??= {} as any)["content-type"] = "application/json";
                r.body = JSON.stringify(r.body);
            }
            return r;
        } catch (e) {
            console.error(e);
            return {
                statusCode: 500,
                body: e.stack ?? e.toString()
            }
        } finally {
            await instance.dispose();
        }
    }
}
