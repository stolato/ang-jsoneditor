# Angular Json Editor

Angular wrapper for [jsoneditor](https://github.com/josdejong/jsoneditor): view, edit, format and validate JSON content interactively, with tree, code, text and view modes.

![Demo Image](projects/docs/images/demo.png)

> This is a fork of mariohmol's [ang-jsoneditor](https://github.com/mariohmol/ang-jsoneditor), kept up to date with recent Angular versions.

## Contents

- [Compatibility](#compatibility)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API](#api)
- [Usage recipes](#usage-recipes)
- [Troubleshooting](#troubleshooting)
- [Migrating to v21](#migrating-to-v21)
- [Local development](#local-development)
- [License](#license)

## Compatibility

| Angular | Library version | Install command                         |
|---------|-----------------|-----------------------------------------|
| 21      | 21.x            | `npm install @maaxgr/ang-jsoneditor@21` |
| 14      | 14.x            | `npm install @maaxgr/ang-jsoneditor@14` |
| 13      | 13.x            | `npm install @maaxgr/ang-jsoneditor@13` |
| 12      | 12.x            | `npm install @maaxgr/ang-jsoneditor@12` |
| 11      | 11.x            | `npm install @maaxgr/ang-jsoneditor@11` |

Version 21 supports `jsoneditor` 9.x and 10.x.

> **Note:** All versions are considered stable, but the library is not used in many production projects, so you may still run into bugs. Please [open an issue](https://github.com/MaaxGr/ang-jsoneditor/issues) if you do.

## Installation

The `jsoneditor` library is a peer dependency and is **not** bundled with this wrapper. Install both packages:

```bash
npm install jsoneditor @maaxgr/ang-jsoneditor@21
```

Then add the jsoneditor stylesheet to your global styles (`src/styles.scss`):

```scss
@import "jsoneditor/dist/jsoneditor.min.css";
```

> Angular 17+ builders (`@angular/build`) do not support the `~` prefix anymore. Use `jsoneditor/...` instead of `~jsoneditor/...`.

You can also add the CSS file to `angular.json` instead:

```json
"styles": [
  "node_modules/jsoneditor/dist/jsoneditor.min.css",
  "src/styles.scss"
]
```

If the build warns that `jsoneditor` is a CommonJS dependency, allow it in `angular.json` under your build options:

```json
"allowedCommonJsDependencies": ["jsoneditor"]
```

## Quick start

### Standalone components (recommended)

`JsonEditorComponent` is a standalone component, so you can import it directly:

```ts
import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { JsonEditorComponent, JsonEditorOptions } from '@maaxgr/ang-jsoneditor';

@Component({
  selector: 'app-root',
  imports: [JsonEditorComponent, JsonPipe],
  template: `
    <json-editor [options]="editorOptions" [data]="initialData" (change)="onChange($event)" />
    <pre>{{ visibleData | json }}</pre>
  `
})
export class AppComponent {
  editorOptions = new JsonEditorOptions();
  initialData = {
    products: [{ name: 'car', product: [{ name: 'honda', model: [{ id: 'civic', name: 'civic' }] }] }]
  };
  visibleData: unknown = this.initialData;

  constructor() {
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
  }

  onChange(json: unknown) {
    this.visibleData = json;
  }
}
```

### NgModule-based apps

`AngJsoneditorModule` is still exported for apps that use NgModules:

```ts
import { NgModule } from '@angular/core';
import { AngJsoneditorModule } from '@maaxgr/ang-jsoneditor';

@NgModule({
  imports: [
    // ...
    AngJsoneditorModule
  ]
})
export class AppModule { }
```

> Components declared in an NgModule must have `standalone: false` on Angular 19+.

## API

### Selector

```html
<json-editor></json-editor>
```

### Inputs

| Input     | Type                | Default                   | Description                                                                 |
|-----------|---------------------|---------------------------|-----------------------------------------------------------------------------|
| `options` | `JsonEditorOptions` | `new JsonEditorOptions()` | Editor configuration (see [Options](#options)).                             |
| `data`    | `object`            | `{}`                      | JSON shown in the editor. A new reference updates the editor in place.      |
| `debug`   | `boolean`           | `false`                   | Logs the options and data passed to jsoneditor to the console.              |

### Outputs

| Output       | Payload | Description                                                                         |
|--------------|---------|-------------------------------------------------------------------------------------|
| `change`     | `any`   | Emits the current JSON on every change. Invalid JSON (in text/code mode) is ignored.  |
| `jsonChange` | `any`   | Emits the current JSON when it changes in `tree` mode (not emitted in `text`/`code`). |

### Forms

The component implements `ControlValueAccessor`, so it works with both `ngModel` and reactive forms (`formControlName`, `[formControl]`).

### Public methods

Get a reference with `viewChild` (or `@ViewChild`) to call these:

| Method                             | Description                                                    |
|------------------------------------|----------------------------------------------------------------|
| `get()`                            | Returns the current JSON (throws if the text is invalid JSON). |
| `set(json)`                        | Replaces the JSON.                                             |
| `update(json)`                     | Replaces the JSON while keeping the expanded state.            |
| `getText()`                        | Returns the content as a string.                               |
| `isValidJson()`                    | Returns `true` if the current text is valid JSON.              |
| `getMode()` / `setMode(mode)`      | Gets/sets the mode: `tree`, `view`, `form`, `code`, `text`.    |
| `getName()` / `setName(name)`      | Gets/sets the root node name.                                  |
| `expandAll()` / `collapseAll()`    | Expands/collapses all nodes (tree mode).                       |
| `focus()`                          | Focuses the editor.                                            |
| `search(query)`                    | Searches for text (tree mode).                                 |
| `getSelection()` / `setSelection(start, end)` | Gets/sets the selection.                            |
| `setSchema(schema, schemaRefs)`    | Sets a JSON schema for validation.                             |
| `getValidateSchema()`              | Returns the compiled schema validator.                         |
| `setOptions(options)`              | Re-creates the editor with new options, keeping its content.   |
| `getEditor()`                      | Returns the underlying `JSONEditor` instance.                  |
| `destroy()`                        | Destroys the editor (called on `ngOnDestroy` automatically).   |

### Options

`JsonEditorOptions` maps the [jsoneditor configuration options](https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#configuration-options). Commonly used ones:

| Option                     | Description                                                      |
|----------------------------|------------------------------------------------------------------|
| `mode` / `modes`           | Initial mode and modes available in the mode switcher.           |
| `schema`                   | JSON schema used to validate the content.                        |
| `search`                   | Shows the search box (tree mode).                                |
| `mainMenuBar`              | Shows the main menu bar.                                         |
| `navigationBar`            | Shows the navigation bar (tree mode).                            |
| `statusBar`                | Shows the status bar (code/text mode).                           |
| `language` / `languages`   | UI language (e.g. `pt-BR`) and custom translations.              |
| `onEditable`               | Controls which nodes can be edited.                              |
| `onValidate`               | Custom validation, returns a list of errors.                     |
| `expandAll`                | **ang-jsoneditor only:** expands all nodes after loading `data`. |

If an option is not mapped in `JsonEditorOptions`, cast it to set any jsoneditor option:

```ts
(this.editorOptions as any).templates = [/* menu templates as in the jsoneditor docs */];
```

## Usage recipes

### Accessing the component

```ts
import { viewChild } from '@angular/core';

editor = viewChild.required(JsonEditorComponent);

getData() {
  console.log(this.editor().get());
}
```

### Reactive forms

```ts
form = inject(FormBuilder).group({
  myinput: [{ nedata: 'test' }]
});
```

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <json-editor [options]="editorOptions" formControlName="myinput" />
</form>
```

### Template-driven forms

```html
<json-editor [options]="editorOptions" [(ngModel)]="data" />
```

### Schema validation

```ts
this.editorOptions.schema = {
  type: 'object',
  properties: { randomNumber: { type: 'number' } },
  required: ['randomNumber']
};
```

```ts
const errors = this.editor().getEditor().validateSchema.errors;
```

### Updating data

The `data` input updates the editor when it gets a **new reference**. The update happens in place, so the current mode, expanded nodes and scroll position are kept. Mutating the existing object will not update the view:

```ts
// does not update the editor
this.data.randomNumber = 5;

// updates the editor
this.data = { ...this.data, randomNumber: 5 };
```

### Changing options at runtime

```ts
toggleStatusBar() {
  this.editorOptions.statusBar = !this.editorOptions.statusBar;
  this.editor().setOptions(this.editorOptions);
}
```

### Multiple editors

Several editors can share the same `JsonEditorOptions` instance. The component never modifies the options object you pass in, and each editor emits its own changes:

```html
@for (product of data.products; track $index) {
  <json-editor [options]="editorOptions" [data]="product" (change)="onChange($index, $event)" />
}
```

### Custom callbacks

You can still set jsoneditor callbacks such as `onChange` or `onChangeJSON` in the options. They are called **in addition to** the `change`/`jsonChange` outputs and the forms integration, which keep working.

## Troubleshooting

### The editor has no height or is too small

Try one of these:

```scss
// global styles
textarea.jsoneditor-text { min-height: 350px; }

// code mode (ace editor)
.ace_editor.ace-jsoneditor { min-height: 500px; }
```

```scss
// component styles
:host ::ng-deep json-editor,
:host ::ng-deep json-editor .jsoneditor,
:host ::ng-deep json-editor > div {
  height: 500px;
}
```

```html
<!-- inline -->
<json-editor style="min-height: 300px;" [options]="editorOptions" [data]="data" />
```

### `Could not resolve "~jsoneditor/dist/jsoneditor.min.css"`

Remove the `~` prefix: `@import "jsoneditor/dist/jsoneditor.min.css";`.

### Reporting bugs

Turn on debug mode and include the console output in your issue:

```html
<json-editor [debug]="true" [options]="editorOptions" [data]="data" />
```

## Migrating to v21

Coming from `@maaxgr/ang-jsoneditor@14`:

1. Update Angular to 21 and install `@maaxgr/ang-jsoneditor@21`.
2. Remove the `~` prefix from the jsoneditor CSS import.
3. `AngJsoneditorModule` still works. In standalone components you can import `JsonEditorComponent` directly instead.
4. `@angular/forms` is now a peer dependency (it was already required).
5. Optional: upgrade `jsoneditor` to 10.x. Both 9.x and 10.x are supported.

Behavior changes in v21 (bug fixes you may notice):

- A new `data` reference (or `setValue()` on a form control) updates the editor in place instead of re-creating it. Mode, expanded nodes and scroll position are kept.
- `setOptions()` keeps the current content, including unsaved edits.
- `(change)` only receives the JSON. Previously, native `change` DOM events from inputs inside the editor (enum selects, checkboxes, search box) also reached the handler as `Event` objects.
- Your `JsonEditorOptions` object is no longer modified, so it can be shared between editors.
- A custom `onChange`/`onChangeJSON` in the options no longer disables the `change`/`jsonChange` outputs and the forms integration.
- `null` data (e.g. after `control.reset()`) is shown as `null` instead of `{}`.

## Local development

```bash
npm install
npm run build:lib    # builds the library into dist/ang-jsoneditor
npm run watch:lib    # rebuilds the library on change
npm run serve:demo   # starts the demo app (build the library first)
npm test             # runs the unit tests (Vitest)
```

The demo app is in `projects/demo`. See [Local Development](projects/docs/local-development.md) for publishing instructions.

### Using a local build in another project

```bash
npm run build:lib
cd dist/ang-jsoneditor && npm pack
# in your project:
npm install /path/to/maaxgr-ang-jsoneditor-21.0.0.tgz
```

## License

[MIT](./LICENSE)
