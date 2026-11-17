import { Component, ElementRef, viewChild, output } from '@angular/core';

@Component({
  selector: 'app-new-album',
  standalone: true,
  templateUrl: './new-album.html',
  styleUrls: ['./new-album.css']
})
export class NewAlbumComponent {
  private dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  closed = output<void>();

  private readonly closeEvent = () => {
    const dialog = this.dialogRef().nativeElement;
    dialog.removeEventListener('close', this.closeEvent);
    this.closed.emit();
  };

  open(): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) {
      dialog.addEventListener('close', this.closeEvent);
      dialog.showModal();
    }
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }
}