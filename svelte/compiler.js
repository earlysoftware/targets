import { compile } from "svelte/compiler";
import * as http from "http";
import express from "express";

// uses svelte compiler to convert svelte code to javascript
function transform(source) {
    try {
        const { js } = compile(source, {
            filename: "EarlySoftware.svelte",
            generate: "dom",
        });
        return js.code;
    } catch {
        return "";
    }
}

function serve() {
    const app = express();
    app.use(express.json());

    app.post("/transform/", (req, res) => {
        const body = req.body;
        if (body.src == undefined) {
            res.status(400);
            res.end("empty src");
            return;
        }
        const result = transform(body.src);
        res.end(result);
    });

    app.get("/", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                name: "earlysoftware-target-svelte",
            })
        );
    });
    app.listen(5935, () => console.log("server ready"));
}

serve();
