import BaseCommand from "../BaseCommand";
import BotChecker from "../BotChecker";

export default class FetchPreview extends BaseCommand {


    async onSave(event) {
        const params = event;

        const {
            botCheck,
            botUserAgent,
            url
        } = params;

        if (botCheck) {
            const { canCrawl , content } = await BotChecker.check(url, botUserAgent);
            delete params.url;
            params.content = content;
            if (!canCrawl) {
                console.log("Bot denied succeeded");
            } else {
                console.log("Bot check succeeded");
            }
        }

        return await this.onSave(params);
    }

    
}