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
    // await runAndLog({
    //     url: "https://gushcrm.com/feed/posts/512/20079?mode=preview"
    // });
    // await runAndLog({
    //     url: "https://www.linkedin.com/posts/madovermarketing_madovermarketing-advertisingandmarketing-activity-7058809799261458432-IOBl",
    //     html: true
    // });
    // await runAndLog({
    //     url: "https://gushcrm.com/feed/posts/512/20079?mode=preview",
    //     pdf: {}
    // });
    await runAndLog({
        url: "https://www.youtube.com/watch?v=6emGENJyIIQ",
        preview: true,
        botUserAgent: "Castyy-Bot/1.1"
    });
}

runTests().then(() => console.log("done"));