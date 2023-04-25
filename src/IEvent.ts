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
    html?: any;
    stopTest?: string;
    output?: string;
    outputExt?: string;
    outputFile?: string;
    video?: any;
    page?: Page;
    browser?: Browser;
}