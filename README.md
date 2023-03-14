# puppeteer-lambda-layer
Create and setup Puppeteer Lambda Layer

## Input

You can supply body of payload as follow,

```typescript
interface queryParameters {
    /**
     * Url to load, either url or content must be provided.
    */
    url?: string;
    /**
     * Html content to load in the browser
    */
    content?: string;
    /**
     * Max Timeout for stopTest to turn true, browser will wait till stopTest turns true till given timeout.
    */
    timeout?: number | string;
    /**
     * Mobile user agent or just true
    */
    mobile?: string | boolean;
    height?: number | string;
    width?: number | string;
    deviceScaleFactor?: number | string;

    /**
     * Saves session as pdf file to given output url, it can be either true or further pdf options for puppeteer.
    */
    pdf?: any;

    /**
     * Records video as mp4 file to given output url, it can be either true or further video options for puppeteer-screen-recorder.
     * To record video, script inside web page must call `window.stopRecording` to stop the video, please use stopTest to wait till
     * resources are ready to animate.
    */
    video?: any;

    /**
     * Saves output url
    */
    html?: string | boolean;

    /**
     * stopTest: a script that, when it will be executed, it must return true to indicate the page is ready
    */
    stopTest?: string;

    /**
     * Output url to save.
    */
    output?: string;

    /**
     * Should robots.txt file must be checked? default is false.
    */
    botCheck?: string | boolean;

    /**
     * User Agent to compare robots.txt.
    */
    botUserAgent?: string;
};
```