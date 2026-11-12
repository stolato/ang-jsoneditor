import { NgModule } from '@angular/core';
import { JsonEditorComponent } from './jsoneditor/jsoneditor.component';

/**
 * Kept for backwards compatibility with NgModule-based apps.
 * Standalone apps can import `JsonEditorComponent` directly.
 */
@NgModule({
  imports: [JsonEditorComponent],
  exports: [JsonEditorComponent]
})
export class AngJsoneditorModule { }
