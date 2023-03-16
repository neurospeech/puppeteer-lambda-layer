const App = require("./dist/App").default;

exports.handler = (event, context) => App.save(event);