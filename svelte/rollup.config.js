import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

// transform all file paths to be served from earlysoftware
function transformImages() {
    return {
        name: "transform-image",
        transform(code) {
            const url = process.env.EARLYSOFTWARE_URL;
            const branch = process.env.EARLYSOFTWARE_BRANCH_UUID;

            code = code.replace(
                /(['"])(.*?)\.(png|jpg|jpeg|gif|svg|bmp)\1/g,
                `"http://${url}/branches/${branch}/files/$2.$3"`
            );
            return {
                code: code,
                map: null,
            };
        },
    };
}
// TODO: dont build only for production
export default {
    input: process.env.EARLYSOFTWARE_TARGET_SRC_PATH,
    output: {
        format: "es",
        file: "_output.js",
    },
    plugins: [
        svelte({
            emitCss: false,
        }),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        transformImages(),
        commonjs(),
        terser(),
    ],
};
