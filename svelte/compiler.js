import { compile } from "svelte/compiler";
import * as http from "http";

// uses svelte compiler to convert svelte code to javascript
function transform(source) {
    const { js } = compile(source, {
        filename: "EarlySoftware.svelte",
        generate: "dom",
    });
    return js.code;
}

function serve() {
    const server = http.createServer((req, res) => {
        if (req.method != "POST") {
            res.writeHead(405);
            res.end("method not allowed!!1");
            return;
        }

        let body = "";
        req.on("data", function (data) {
            body += data;
        });
        req.on("end", function () {
            if (body.length == 0) {
                res.writeHead(400);
                res.end("empty body");
                return;
            }

            // parse body
            let parsed = {};
            try {
                parsed = JSON.parse(body.toString());
            } catch (error) {
                res.writeHead(400);
                res.end("syntax error");
                return;
            }

            if (parsed.src == null) {
                res.writeHead(400);
                res.end("parsed.src is null");
                return;
            }

            // compile
            const output = transform(parsed.src);
            res.writeHead(200);
            res.end(output);

            // exit if requierd
            if (parsed.exit == true) {
                process.exit(0);
            }
        });
    });
    server.listen(5935, "localhost", () => console.log("server started"));
}

serve();
