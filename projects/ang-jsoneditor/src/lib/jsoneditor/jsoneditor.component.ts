import {
  Component, ElementRef, Input, OnInit, OnDestroy, ViewChild,
  Output, EventEmitter, forwardRef, ChangeDetectionStrategy
} from '@angular/core';
// @ts-ignore - jsoneditor ships without TypeScript typings
import JSONEditor from 'jsoneditor';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JsonEditorOptions, JsonEditorMode, JsonEditorTreeNode, IError } from './jsoneditoroptions';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'json-editor',
  standalone: true,
  // Native `change` events from inputs inside jsoneditor (selects, checkboxes, search box)
  // are stopped here so they don't bubble to the host and collide with the `change` output.
  template: `<div [id]="id" #jsonEditorContainer (change)="$event.stopPropagation()"></div>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonEditorComponent),
      multi: true
    }
  ],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JsonEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private editor: any;
  public id = 'angjsoneditor' + Math.floor(Math.random() * 1000000);
  disabled = false;
  isFocused = false;

  @ViewChild('jsonEditorContainer', { static: true }) jsonEditorContainer: ElementRef;

  private _data: Object = {};

  @Input() options: JsonEditorOptions = new JsonEditorOptions();
  @Input('data')
  set data(value: Object) {
    this._data = value;
    if (this.editor) {
      // Update in place: keeps mode, expanded nodes, selection and scroll position.
      this.editor.update(value);
      if (this.options.expandAll) {
        this.editor.expandAll();
      }
    }
  }
  @Input() debug = false;

  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  jsonChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }


  ngOnInit() {
    this.createEditor(this._data);
  }

  private createEditor(data: any) {
    const editorOptions = this.buildEditorOptions(this.options);
    if (this.debug) {
      console.log(editorOptions, data);
    }
    this.editor = new JSONEditor(this.jsonEditorContainer.nativeElement, editorOptions, data);

    if (this.options.expandAll) {
      this.editor.expandAll();
    }
  }

  /**
   * Builds the options object passed to jsoneditor. The user's options object is never mutated,
   * so the same JsonEditorOptions instance can be shared between several editors.
   */
  private buildEditorOptions(options: JsonEditorOptions): any {
    const editorOptions: any = { ...options };

    // expandAll is an option only supported by ang-jsoneditor and not by the original jsoneditor.
    delete editorOptions.expandAll;

    // Unset options must not reach jsoneditor: an explicit `undefined` would override
    // jsoneditor's own defaults (e.g. hide the main menu bar).
    for (const key of Object.keys(editorOptions)) {
      if (editorOptions[key] === undefined) {
        delete editorOptions[key];
      }
    }

    const userOnChange = options.onChange;
    editorOptions.onChange = () => {
      userOnChange?.();
      this.onChange(undefined);
    };

    if (editorOptions.mode === 'text' || editorOptions.mode === 'code') {
      // onChangeJSON is not supported by jsoneditor in text/code mode.
      delete editorOptions.onChangeJSON;
    } else {
      const userOnChangeJSON = options.onChangeJSON as ((json: any) => void) | undefined;
      editorOptions.onChangeJSON = (json: any) => {
        userOnChangeJSON?.(json);
        this.onChangeJSON(json);
      };
    }

    return editorOptions;
  }

  ngOnDestroy() {
    this.destroy();
  }


  /**
   * ngModel
   * ControlValueAccessor
   */

  // ControlValueAccessor implementation
  writeValue(value: any) {
    this.data = value;
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: any) {
    this.onChangeModel = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Implemented as part of ControlValueAccessor.
  private onTouched = () => {
  };

  // Implemented as part of ControlValueAccessor.
  private onChangeModel = (e) => {
  };

  public onChange(e) {
    if (this.editor) {
      try {
        const json = this.editor.get();
        this.onChangeModel(json);
        this.change.emit(json);
      } catch (e) {
        if (this.debug) {
          console.log(e);
        }
      }
    }
  }

  public onChangeJSON(e) {
    if (this.editor) {
      try {
        this.jsonChange.emit(this.editor.get());
      } catch (e) {
        if (this.debug) {
          console.log(e);
        }
      }
    }
  }


  /**
   * JSON EDITOR FUNCTIONS
   */

  public collapseAll() {
    this.editor.collapseAll();
  }

  public expandAll() {
    this.editor.expandAll();
  }

  public focus() {
    this.editor.focus();
  }

  public get(): JSON {
    return this.editor.get();
  }

  public getMode(): JsonEditorMode {
    return this.editor.getMode() as JsonEditorMode;
  }

  public getName(): string {
    return this.editor.getName();
  }

  public getText(): string {
    return this.editor.getText();
  }

  public set(json: JSON) {
    this.editor.set(json);
  }

  public setMode(mode: JsonEditorMode) {
    this.editor.setMode(mode);
  }

  public setName(name: string) {
    this.editor.setName(name);
  }

  public setSelection(start, end) {
    this.editor.setSelection(start, end);
  }

  public getSelection(): any {
    return this.editor.getSelection();
  }

  public getValidateSchema(): any {
    return this.editor.validateSchema;
  }

  public setSchema(schema: any, schemaRefs: any) {
    this.editor.setSchema(schema, schemaRefs);
  }

  public search(query: string) {
    this.editor.search(query);
  }

  public setOptions(newOptions: JsonEditorOptions) {
    this.options = newOptions;
    if (!this.editor) {
      return;
    }

    // Keep the current content (including user edits) when re-creating the editor.
    const text: string = this.editor.getText();
    this.editor.destroy();
    this.createEditor(this._data);
    try {
      this.editor.set(JSON.parse(text));
    } catch {
      this.editor.setText(text);
    }
    if (this.options.expandAll) {
      this.editor.expandAll();
    }
  }

  public update(json: JSON) {
    this.editor.update(json);
  }

  public destroy() {
    this.editor?.destroy();
  }

  public getEditor(){
    return this.editor;
  }

  public isValidJson() {
    try {
      JSON.parse(this.getText());
      return true;
    } catch (e) {
      return false;
    }
  }
}

export { JsonEditorOptions };
export type { JsonEditorMode, JsonEditorTreeNode, IError };
