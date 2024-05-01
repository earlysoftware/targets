import { compile } from "svelte/compiler";
import * as http from "http";

// uses svelte compiler to convert svelte code to javascript
function transform(source) {
    const { js } = compile(source, {});
    console.log(js.code);
}

function serve() {
    const server = http.createServer((req, res) => {
        if (req.method != "POST") {
            res.writeHead(405);
            res.end("method not allowed!!1");
            return;
        }

        res.writeHead(200);
        res.end("hello");
    });
    server.listen(5935, "localhost", () => console.log("server started"));
}

serve();
