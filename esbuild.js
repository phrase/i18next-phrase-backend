const { build } = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

build({
    entryPoints: ['./src/index.ts'],
    outfile: 'dist/index.cjs.js',
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'cjs',
    target: ["esnext", "node14"],
    plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));

build({
    entryPoints: ['./src/index.ts'],
    outfile: 'dist/index.esm.js',
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    target: ["esnext", "node14"],
    plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
