import {buildSync} from "esbuild"

buildSync({
    entryPoints:['src/index.ts'],
    outdir:'dist',
    bundle:true,
    loader:{
        '.ts':"ts"
    },
    minify:true,
    platform:'node'
})
