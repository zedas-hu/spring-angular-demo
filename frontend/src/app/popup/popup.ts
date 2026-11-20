import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-popup',
  templateUrl: './popup.html',
})
export class Popup {
  className = input.required<string>({ alias: 'class' });
  text = input.required<string>();
  readonly uniqueId = crypto.randomUUID();
}
