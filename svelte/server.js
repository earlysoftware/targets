import express from "express";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

async function transform(src) {
    await mkdir("temp").catch((e) => {
        throw e;
    });

    await writeFile("temp/_temp.svelte", src, (err) => {
        if (err) {
            throw "error";
        }
    });
    const execSync = promisify(exec);

    // TODO: handle errors
    await execSync("npm run rollup");

    const output = await readFile("temp/_output.js", {
        encoding: "utf8",
    }).catch((e) => {
        throw e;
    });

    // cleanup
    await rm("temp", { recursive: true, force: true }).catch((e) => {
        throw e;
    });
    return output;
}

function serve() {
    const app = express();
    app.use(express.json());

    app.post("/transform/", async (req, res) => {
        const body = req.body;
        if (body.src == undefined) {
            res.status(400);
            res.end("empty src");
            return;
        }

        try {
            const result = await transform(body.src);
            res.status(200);
            res.end(result);
        } catch (e) {
            res.status(500);
            res.end(e.toString());
        }

        if (body.exit != undefined && body.exit == true) {
            console.log("exit");
            exit(0);
        }
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
