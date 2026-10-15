import App from "./dist/App.js";

export const handler = (event, context) => App.save(event);