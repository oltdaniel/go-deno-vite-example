import { resolve } from "@std/path";
import { expandGlobSync, WalkEntry } from "@std/fs";
import { defineConfig, Plugin } from 'vite';
import deno from '@deno/vite-plugin'

// Get the directory name of the current module
const __dirname = new URL('.', import.meta.url).pathname;

// A minimal template processor allowing the use of a layout and including partials
export function minimalTemplatePreprocessor(options: { layoutsDir: string; partialsDir: string }): Plugin {
  return {
    name: "vite:minimal-template-preprocessor",
    enforce: "pre",

    async transform(code, id) {
      if (!id.endsWith(".html")) return;

      let transformed = code;

      // Track dependency files
      const dependencies: string[] = [];

      // Layout detection: <!-- layout: base.html -->
      const layoutMatch = transformed.match(/<!--\s*layout:\s*(.+?)\s*-->/);
      if (layoutMatch) {
        const layoutName = layoutMatch[1];
        const layoutPath = `${options.layoutsDir}/${layoutName}`;
        dependencies.push(layoutPath);
        const layoutContent = await Deno.readTextFile(layoutPath);

        // Match content placeholder (feel free to replace this with something that fits yoru setup,
        // /{{\s*embed\s*}}/g is used for layouts in the fiber framework html templates)
        const contentMatch = layoutContent.match(/{{\s*embed\s*}}/g)
        if(contentMatch) {
          // Inject original content (without the layout comment) into layout at marker {{ embed }}
          transformed = layoutContent.replace(contentMatch[0], transformed.replace(layoutMatch[0], ''));
        } else {
          throw new Error(`Failed to apply layout to '${id}' due to missing content placeholder in layout '${layoutPath}'`)
        }
      }

      // Partial includes: <!-- include: header.html -->
      const includeRegex = /<!--\s*include:\s*(.+?)\s*-->/g;
      transformed = await replaceAsync(transformed, includeRegex, async (_, partialName) => {
        const partialPath = `${options.partialsDir}/${partialName}`;
        dependencies.push(partialPath);
        const partialContent = await Deno.readTextFile(partialPath);
        return partialContent;
      });

      // Register dependencies for Vite's watcher
      dependencies.forEach(dep => {
        this.addWatchFile(dep);
      });

      return {
        code: transformed,
        map: null,
      };
    },
  };
}

// Utility to support async replacements
async function replaceAsync(str: string, regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>) {
  const promises: Promise<string>[] = [];
  const matches: string[] = [];

  str.replace(regex, (...args) => {
    matches.push(args[0]);
    promises.push(asyncFn(...args));
    return "";
  });

  const results = await Promise.all(promises);

  return str.replace(regex, () => results.shift()!);
}

// Use glob to find all HTML files
const htmlFiles = expandGlobSync("views/**/*.html", { root: __dirname });

// Create an input object for Rollup
const input = Object.fromEntries(
  (htmlFiles as unknown as Array<WalkEntry>).map(file => [file.name.replace(/\.html$/, ''), resolve(file.path)])
);

// Actual vite configuration
export default defineConfig({
  build: {
    rollupOptions: {
      input,
    },
  },
  resolve: {
    alias: {
      '@lib': resolve(__dirname, 'lib'),
    }
  },
  plugins: [
    deno(),
    minimalTemplatePreprocessor({
      layoutsDir: resolve(__dirname, 'views/layouts'),
      partialsDir: resolve(__dirname, 'views/partials'),
    })
  ]
});
