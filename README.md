# Hello World with Go + Vite + Deno

This is an example project structure for a Go Web Application. The templates and their assets are bundled with Vite and all build tasks and JS related work is done by Deno.

## Requirements

- [Deno](https://deno.com/)
- [Go](https://go.dev/)

## Setup

```bash
# Enter dev mode, which live rebuilds everything and restarts everything automatically
deno task dev

# Just build everything, first the web things, then Go stuff
deno task build

# => Modify deno.json tasks to modify commands
```

## Motivation

Without JS and CSS bundling, working with HTML Pages or Templates is too complex and requires much manual tuning. You could always place a JS Frontend in front of you Go backend, but this adds a lot of overhead, a ton of dependencies and a complex workflow, mainly for the nice bundling of assets. Staying with Go templates but integrating modern bundling into the workflow before it is served by the backend, is in my opinion a nice middle ground.

## Web bundling

The bundling is done by Vite, where every .html file in the [`views`](./web/views) folder is configured as a entrypoint/input. This will require a restart when adding new .html files. Additionally, a minimal templating pre-processor is added in order to allow Go independent templating.

### Directory structure

- `web/lib`: Alias import path with `@lib` for shared JavaScript code.
- `web/views`: Main input for the HTML files that will be transformed.
- `web/views/layouts`: Layouts that will be used for minimal templating but also be transformed.
- `web/views/partials`: Partials that will be used for minimal templating but also be transformed.
- `web/views/pages`: This doesn't have a specific meaning, just adds some more structure to the folder. Can be renamed.
- `web/dist/assets`: Bundled vite assets, should be served at `/assets`.
- `web/dist/views`: Bundled vite HTML pages (injected with stylesheet and script tags) and minimal templating executed.

### Minimal Templating

```html
<!-- layout: default.html -->
```
Specify a layout file from the [`views/layouts`](./web/views/layouts) directory. There should be a content placeholder (next point) where the content of the page/file will be placed at.

```html
{{ embed }}
```
This is the content placeholder (which can be customized in the plugin) which is also used by the Fiber HTML Template Engine for layouts. This means, the layouts are still usable by the Go backend themselves without this custom plugin or any overhead/conflicts.

```html
<!-- include: header.html -->
```
This includes the given filename from the [`views/partials`](./web/views/partials) directory and replaces this HTML comment with its content.

## Go compiling

The compiling and execution of the server binary is managed by Deno tasks in the root [`deno.json`](./deno.json) file. This allows for quick and easy changes without touching the script. Important to note here, the project is structured towards a single server binary and not for huge complex multi-binary projects.

## Use cases

The application developed here focusses mainly on standard library functionalities. The only dependencies that have been added are the tools themselves (Go + Deno + Vite), a Go HTML Template helper from the Fiber Framework for easier HTML rendering that also support Layouts and partials (as this is still a non-trivial task with the standard library), and a small JS DOM Library called VanJS for demonstration purposes.

## License

[![GitHub License](https://img.shields.io/github/license/oltdaniel/go-deno-vite-example)](./LICENSE)