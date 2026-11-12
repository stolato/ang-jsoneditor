import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { JsonEditorComponent, JsonEditorOptions } from './jsoneditor.component';
import { AngJsoneditorModule } from '../ang-jsoneditor.module';

const SAMPLE = { products: [{ name: 'car', model: [{ id: 'civic' }] }] };

function treeOptions(extra: Partial<JsonEditorOptions> = {}): JsonEditorOptions {
  const options = new JsonEditorOptions();
  options.mode = 'tree';
  return Object.assign(options, extra);
}

describe('JsonEditorComponent', () => {
  let fixture: ComponentFixture<JsonEditorComponent>;
  let component: JsonEditorComponent;

  function create(options = treeOptions(), data: object = SAMPLE) {
    fixture = TestBed.createComponent(JsonEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonEditorComponent]
    }).compileComponents();
  });

  describe('rendering', () => {
    it('creates the jsoneditor inside the container', () => {
      create();
      const container: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(container.id).toMatch(/^angjsoneditor\d+$/);
      expect(container.querySelector('.jsoneditor')).not.toBeNull();
      expect(component.getEditor()).toBeTruthy();
    });

    it('generates a unique id per instance', () => {
      create();
      const first = component.id;
      create();
      expect(component.id).not.toBe(first);
    });

    it('shows the data passed through the input', () => {
      create();
      expect(component.get()).toEqual(SAMPLE);
    });

    it('starts with an empty object when no data is given', () => {
      fixture = TestBed.createComponent(JsonEditorComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('options', treeOptions());
      fixture.detectChanges();
      expect(component.get()).toEqual({});
    });
  });

  describe('data input', () => {
    it('re-creates the editor when a new reference is set', () => {
      create();
      const before = component.getEditor();

      fixture.componentRef.setInput('data', { other: true });
      fixture.detectChanges();

      expect(component.getEditor()).not.toBe(before);
      expect(component.get()).toEqual({ other: true });
    });

    it('keeps a single editor in the DOM after re-creating it', () => {
      create();
      fixture.componentRef.setInput('data', { a: 1 });
      fixture.componentRef.setInput('data', { b: 2 });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.jsoneditor').length).toBe(1);
    });
  });

  describe('editor methods', () => {
    it('set() and get() replace and read the JSON', () => {
      create();
      component.set({ hello: 'world' } as any);
      expect(component.get()).toEqual({ hello: 'world' });
    });

    it('update() replaces the JSON', () => {
      create();
      component.update({ updated: 1 } as any);
      expect(component.get()).toEqual({ updated: 1 });
    });

    it('getText() returns the JSON as string', () => {
      create(treeOptions(), { a: 1 });
      expect(JSON.parse(component.getText())).toEqual({ a: 1 });
    });

    it('isValidJson() detects valid and invalid text', () => {
      create(treeOptions({ mode: 'text' }), { a: 1 });
      expect(component.isValidJson()).toBe(true);

      component.getEditor().setText('{ invalid');
      expect(component.isValidJson()).toBe(false);
    });

    it('getMode() / setMode() switch the mode', () => {
      create();
      expect(component.getMode()).toBe('tree');

      component.setMode('text');
      expect(component.getMode()).toBe('text');
      expect(component.get()).toEqual(SAMPLE);
    });

    it('getName() / setName() change the root name', () => {
      create();
      component.setName('root');
      expect(component.getName()).toBe('root');
    });

    it('expandAll() / collapseAll() toggle the tree nodes', () => {
      create();
      const root = component.getEditor().node;

      component.expandAll();
      expect(root.childs[0].expanded).toBe(true);

      component.collapseAll();
      expect(root.childs[0].expanded).toBe(false);
    });

    it('setOptions() re-creates the editor with the new options', () => {
      create();
      const before = component.getEditor();

      component.setOptions(treeOptions({ mode: 'text' }));

      expect(component.getEditor()).not.toBe(before);
      expect(component.getMode()).toBe('text');
      expect(component.get()).toEqual(SAMPLE);
    });
  });

  describe('options', () => {
    it('expandAll option expands all nodes on load', () => {
      create(treeOptions({ expandAll: true }));
      const firstChild = component.getEditor().node.childs[0];
      expect(firstChild.expanded).toBe(true);
    });

    it('does not pass the expandAll option to jsoneditor', () => {
      create(treeOptions({ expandAll: true }));
      expect('expandAll' in component.getEditor().options).toBe(false);
    });

    it('renders the main menu bar with the mode switcher by default', () => {
      const options = treeOptions();
      options.modes = ['code', 'text', 'tree', 'view'];
      create(options);

      expect(fixture.nativeElement.querySelector('.jsoneditor-menu')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.jsoneditor-modes')).not.toBeNull();
    });

    it('does not let unset (undefined) options override jsoneditor defaults', () => {
      const options = treeOptions({ mainMenuBar: undefined, navigationBar: undefined } as any);
      create(options);

      expect(fixture.nativeElement.querySelector('.jsoneditor-menu')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.jsoneditor-navigation-bar')).not.toBeNull();
    });

    it('respects options explicitly set to false', () => {
      create(treeOptions({ mainMenuBar: false }));
      expect(fixture.nativeElement.querySelector('.jsoneditor-menu')).toBeNull();
    });

    it('keeps a custom onChange instead of overriding it', () => {
      const custom = vi.fn();
      const options = treeOptions();
      options.onChange = custom;
      create(options);

      expect(component.options.onChange).toBe(custom);
    });

    it('debug mode logs options and data', () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      fixture = TestBed.createComponent(JsonEditorComponent);
      fixture.componentRef.setInput('options', treeOptions());
      fixture.componentRef.setInput('debug', true);
      fixture.detectChanges();

      expect(log).toHaveBeenCalled();
      log.mockRestore();
    });
  });

  describe('outputs', () => {
    it('emits change with the current JSON', () => {
      create();
      const emitted: unknown[] = [];
      component.change.subscribe(v => emitted.push(v));

      component.set({ changed: true } as any);
      component.options.onChange!();

      expect(emitted).toEqual([{ changed: true }]);
    });

    it('does not emit change when the text is invalid JSON', () => {
      create(treeOptions({ mode: 'text' }));
      const emitted: unknown[] = [];
      component.change.subscribe(v => emitted.push(v));

      component.getEditor().setText('{ invalid');
      component.options.onChange!();

      expect(emitted).toEqual([]);
    });

    it('emits jsonChange with the current JSON in tree mode', () => {
      create();
      const emitted: unknown[] = [];
      component.jsonChange.subscribe(v => emitted.push(v));

      component.set({ tree: 1 } as any);
      component.options.onChangeJSON!();

      expect(emitted).toEqual([{ tree: 1 }]);
    });

    it('does not register onChangeJSON in jsoneditor for text/code modes', () => {
      create(treeOptions({ mode: 'text' }));
      expect(component.getEditor().options.onChangeJSON).toBeFalsy();
    });
  });

  describe('lifecycle', () => {
    it('destroys the jsoneditor when the component is destroyed', () => {
      create();
      const destroy = vi.spyOn(component.getEditor(), 'destroy');

      fixture.destroy();

      expect(destroy).toHaveBeenCalled();
    });

    it('destroy() is safe before the editor exists', () => {
      fixture = TestBed.createComponent(JsonEditorComponent);
      expect(() => fixture.componentInstance.destroy()).not.toThrow();
    });
  });
});

@Component({
  imports: [ReactiveFormsModule, JsonEditorComponent],
  template: `<json-editor [options]="options" [formControl]="control" />`
})
class ReactiveHostComponent {
  options = treeOptions();
  control = new FormControl<object>({ initial: true });
  editor = viewChild.required(JsonEditorComponent);
}

@Component({
  imports: [FormsModule, AngJsoneditorModule],
  template: `<json-editor [options]="options" [(ngModel)]="model" />`
})
class NgModelHostComponent {
  options = treeOptions();
  model: object = { initial: 'ngModel' };
  editor = viewChild.required(JsonEditorComponent);
}

describe('JsonEditorComponent forms integration', () => {
  it('reactive forms: control value is shown in the editor', async () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.editor().get()).toEqual({ initial: true });
  });

  it('reactive forms: setValue() updates the editor', async () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();

    fixture.componentInstance.control.setValue({ next: 2 });
    await fixture.whenStable();

    expect(fixture.componentInstance.editor().get()).toEqual({ next: 2 });
  });

  it('reactive forms: editor changes update the control', async () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const editor = fixture.componentInstance.editor();

    editor.set({ fromEditor: true } as any);
    editor.options.onChange!();

    expect(fixture.componentInstance.control.value).toEqual({ fromEditor: true });
  });

  it('reactive forms: disabling the control sets the disabled flag', async () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();

    fixture.componentInstance.control.disable();

    expect(fixture.componentInstance.editor().disabled).toBe(true);
  });

  it('ngModel (via AngJsoneditorModule): model is shown and editor changes update it', async () => {
    const fixture = TestBed.createComponent(NgModelHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const editor = fixture.componentInstance.editor();

    expect(editor.get()).toEqual({ initial: 'ngModel' });

    editor.set({ edited: 1 } as any);
    editor.options.onChange!();

    expect(fixture.componentInstance.model).toEqual({ edited: 1 });
  });
});
