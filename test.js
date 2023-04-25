const { writeFileSync } = require("fs");

const App = require("./dist/App").default;
App.save({
    body: {
        url: "https://gushcrm.com/feed/posts/512/20079?mode=preview"
    }
}).then((s) => {

    console.log(s);

}, console.error);
