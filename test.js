const { writeFileSync } = require("fs");

const App = require("./dist/App").default;

async function runAndLog(body) {
    try {
        console.log(await App.save({ body }));
    } catch (error) {
        console.error(error?.stack ?? error);
    }
}

async function runTests() {
    await runAndLog({
        url: "https://gushcrm.com/feed/posts/512/20079?mode=preview"
    });
    await runAndLog({
        url: "https://gushcrm.com/feed/posts/512/20079?mode=preview",
        html: true
    });
    await runAndLog({
        url: "https://gushcrm.com/feed/posts/512/20079?mode=preview",
        pdf: {}
    });
    await runAndLog({
        url: "https://www.youtube.com/watch?v=BmT9Ar41Kn4",
        botCheck: true,
        botUserAgent: "Google-Bot/1.1"
    });
}

runTests().then(() => console.log("done"));