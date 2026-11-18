import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-popup',
  templateUrl: './popup.html',
})
export class Popup {
  className = input.required<String>({ alias: 'class' });
  text = input.required<String>();
  uniqueId = crypto.randomUUID();
}
