import express from "express";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

process.env.EARLYSOFTWARE_FILE_EXTENSION = ".svelte";

async function transform(srcPath, targetPath) {
    process.env.EARLYSOFTWARE_TARGET_SRC_PATH = srcPath;
    console.log(process.env.EARLYSOFTWARE_TARGET_SRC_PATH);

    const execSync = promisify(exec);

    // TODO: handle errors
    await execSync(`npm run rollup --prefix ${targetPath}`);

    const output = await readFile(`${targetPath}/_output.js`, {
        encoding: "utf8",
    }).catch((e) => {
        throw e;
    });

    // cleanup will be handled later
    return output;
}

async function cleanup(targetPath) {
    await rm(`${targetPath}/_output.js`, {
        force: true,
    }).catch((e) => {
        throw e;
    });
}

function serve() {
    const app = express();
    app.use(express.json());

    app.post("/transform/", async (req, res) => {
        const body = req.body;
        if (body.srcPath == undefined || body.targetPath == undefined) {
            res.status(400);
            res.end("empty srcPath or targetPath");
            return;
        }

        await cleanup(body.targetPath)
            .catch(() => {
                res.status(500);
                res.end("cleanup error");
            })
            .then(async () => {
                try {
                    const result = await transform(
                        body.srcPath,
                        body.targetPath
                    );
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
