import fetch from "node-fetch";
import robotsParser from "robots-parser";

export default class BotChecker {

    public static async check(url: string, userAgent: string, botCheck = false) {
        const canCrawl = !botCheck ? true : await this.checkRobots(url, userAgent);
        let content = "";

        if (canCrawl) {
            content = await (await fetch(url)).text();
        } else {

        const u = new URL(url);
        u.search = "";
        content = `
<html>
    <style>
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            padding : 5px;
        }
        div {
            color: blue;
            font-weight: bold;
            font-size: 15px;
        }
    </style>
    <body>
        <div>${u.host.toString()}${u.pathname}</div>
    </body>
</html>
`;
    }
        return {
            canCrawl,
            content
        }
    }

    public static async checkRobots(url: string, userAgent: string) {
        try {
            const u = new URL(url);
            u.pathname = "/robots.txt";
            u.search = "";
            const robotsUrl = u.toString();
            const body = await fetch(robotsUrl);
            if (body.status === 404) {
                return true;
            }
            const text = await body.text();
            const bot = robotsParser(robotsUrl, text);
            return bot.isAllowed(url, userAgent);
        } catch (ex) {
            console.log(ex);
            return true;
        }
    }

}
