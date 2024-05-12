import express from "express";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

async function transform() {
    const execSync = promisify(exec);

    // TODO: handle errors
    await execSync("npm run rollup");

    const output = await readFile("temp/_output.js", {
        encoding: "utf8",
    }).catch((e) => {
        throw e;
    });

    // cleanup
    cleanup();
    return output;
}

async function cleanup() {
    await rm("temp", { recursive: true, force: true }).catch((e) => {
        throw e;
    });
}

// recursively create directories and files
async function createFiles(p, content) {
    await mkdir(path.dirname(p), { recursive: true })
        .catch((e) => {
            throw e;
        })
        .then(async () => {
            await writeFile(p, content, { encoding: "utf-8" }).catch((e) => {
                throw e;
            });
        });
}

function serve() {
    const app = express();
    app.use(express.json());

    app.post("/transform/", async (req, res) => {
        const body = req.body;
        if (body.files == undefined) {
            res.status(400);
            res.end("empty src");
            return;
        }

        // cleanup only if required, so error handling is useless here
        await cleanup();

        try {
            await mkdir("temp").catch((e) => {
                throw e;
            });

            // write files
            for (const file of body.files) {
                const name = file.name == "_" ? "_temp.svelte" : file.name;
                console.log(name);

                createFiles(`temp/${name}`, file.src).catch((e) => {
                    // TODO: should this error be handled better
                    console.log(e);
                });
            }
        } catch (e) {
            console.log(e);
            res.status(500);
            res.end(e.toString());
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
    });

    app.get("/exit", (req, res) => {
        res.status(204);
        res.end("");
        process.exit(0);
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
