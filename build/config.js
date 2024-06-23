import { build } from 'esbuild';
import { clean } from 'esbuild-plugin-clean';

await build({
  entryPoints: ['./index.js'],
  outfile: './dist/parsetab.js',
  bundle: true,
  sourcemap: true,
  globalName: 'parsetab',
  format: 'iife',
  plugins: [
    clean({
      patterns: ['./dist/*'],
    }),
  ],
});

await build({
  entryPoints: ['./index.js'],
  outfile: './dist/parsetab.min.js',
  bundle: true,
  minify: true,
});
