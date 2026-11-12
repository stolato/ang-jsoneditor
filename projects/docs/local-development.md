# Local Development Notes

Requirements: Node.js 20.19+, 22.12+ or 24+ (required by Angular 21).

## Get demo running

1. Install dependencies: `npm install`
2. Build library: `npm run build:lib` (or `npm run watch:lib` to rebuild on change)
3. Start demo: `npm run serve:demo` and open http://localhost:4200

The demo imports the library from `dist/ang-jsoneditor` (see `paths` in `tsconfig.json`), so build the library before you start the demo.

## Run tests

`npm test` runs the library unit tests with Vitest.

## Publish to npm

1. `npm login`
2. Change Version in `projects/ang-jsoneditor/package.json` (major version = Angular version)
3. `npm run publish`
