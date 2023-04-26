import { Browser, Page } from "puppeteer-core";

export interface IEvent {
    url?: string;
    content?: string;
    timeout?: number;
    mobile?: boolean;
    height?: number;
    width?: number;
    deviceScaleFactor?: number;
    pdf?: any;
    html?: "html" | "body" | boolean;
    flattenStyle?: boolean;
    stopTest?: string;
    output?: string;
    outputExt?: string;
    outputFile?: string;
    quality?: number;
    video?: any;
    result?: any;
    page?: Page;
    browser?: Browser;
}