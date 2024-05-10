import { terser } from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

// TODO: dont build only for production
export default {
    input: `_temp.svelte`,
    output: {
        format: "es",
        file: "dist/output.js",
    },
    plugins: [
        svelte({}),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs(),
        terser(),
    ],
};
