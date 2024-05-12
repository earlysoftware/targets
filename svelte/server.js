import express from "express";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

async function transform(src, targetPath) {
    await mkdir(`${targetPath}/temp`).catch(() => {
        throw e;
    });
    await writeFile(`${targetPath}/temp/_temp.svelte`, src, "utf-8").catch(
        (e) => {
            throw e;
        }
    );

    const execSync = promisify(exec);

    // TODO: handle errors
    await execSync(`npm run rollup --prefix ${targetPath}`);

    const output = await readFile(`${targetPath}/temp/_output.js`, {
        encoding: "utf8",
    }).catch((e) => {
        throw e;
    });

    // cleanup will be handled later
    return output;
}

async function cleanup(targetPath) {
    await rm(`${targetPath}/temp`, { recursive: true, force: true }).catch(
        (e) => {
            throw e;
        }
    );
}

function serve() {
    const app = express();
    app.use(express.json());

    app.post("/transform/", async (req, res) => {
        const body = req.body;
        if (body.src == undefined || body.targetPath == undefined) {
            res.status(400);
            res.end("empty src or targetPath");
            return;
        }

        await cleanup(body.targetPath)
            .catch(() => {
                res.status(500);
                res.end("cleanup error");
            })
            .then(async () => {
                try {
                    const result = await transform(body.src, body.targetPath);
                    res.status(200);
                    res.end(result);
                } catch (e) {
                    res.status(500);
                    res.end(e.toString());
                }
            });
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
