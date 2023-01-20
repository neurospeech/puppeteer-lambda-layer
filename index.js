const SaveUrl = require("./dist/SaveUrl").default;

exports.handler = async (event, context) => {
    return await SaveUrl.save(event);
};