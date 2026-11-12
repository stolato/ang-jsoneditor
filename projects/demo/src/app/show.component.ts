import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-show',
  standalone: true,
  template: '<div>{{showData()}}</div>'
})
export class ShowComponent {

  @Input()
  public data;

  showData(){
    return JSON.stringify(this.data, null, 2);
  }

}
