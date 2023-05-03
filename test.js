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
        url: "https://www.linkedin.com/posts/blu-swan-media-b2399a135_our-new-model-kate-is-in-town-bookings-activity-7059447602848612353-2jZM?utm_source=share&utm_medium=member_desktop",
        preview: true,
        botUserAgent: "Google-Bot/1.1"
    });
}

runTests().then(() => console.log("done"));