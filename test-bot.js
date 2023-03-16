const { writeFileSync } = require("fs");

const url = "https://www.youtube.com/watch?v=j6hwb1IE0xk";

async function test() {
    const r = await fetch(url);
    const text = await r.text();
    writeFileSync("./index.html", text, "utf-8");
}

test().then(console.log, console.error);

