const App = require("./dist/App").default;
App.save({
    body: {
        url: "https://www.youtube.com/watch?v=wsZZScXcQAU",
        botCheck: true,
        botUserAgent: "Google-Bot/1.0"
    }
}).then(console.log, console.error);