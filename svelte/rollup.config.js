import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

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
        commonjs(),
        terser(),
    ],
};
