/* Copyright by Zoltán Szilágyi, 2021-2024 */

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';

export type MessageType = 'info' | 'warning' | 'error';

export interface MessageOptions {
  type?: MessageType;
  timer?: number;
  html?: string;
  locked?: boolean;
  clickCallback?: () => void;
  counterCallback?: () => void;
}

export class Message {
  private timer: number;

  constructor(
    private readonly container: HTMLElement,
    private readonly type: MessageType,
    private readonly startTimer: number,
    timer: number,
    private html: string,
    private readonly clickCallback?: () => void,
    private readonly counterCallback?: () => void,
  ) {
    this.timer = timer;
    this.element = this.container.ownerDocument.createElement('div');
    this.element.className = `message message_${type}`;
    this.element.textContent = html.replace(/\$C/, String(timer));
    this.element.addEventListener('click', () => {
      this.timer = 1;
      this.clickCallback?.();
    });
    this.container.append(this.element);
    this.height = this.element.clientHeight;
  }

  private readonly element: HTMLDivElement;
  private readonly height: number;

  setHTML(html: string): void {
    this.html = html;
    this.timer = this.startTimer - 1;
    this.element.textContent = html;
  }

  tick(): boolean {
    this.timer--;
    switch (this.timer) {
      case this.startTimer - 1:
        this.element.classList.remove('message_close');
        break;
      case 0:
        this.element.classList.remove(`message_${this.type}`);
        this.element.classList.add('message_close');
        this.counterCallback?.();
        break;
      case -1:
        this.element.remove();
        return true;
    }

    if (this.html.includes('$C')) {
      this.element.textContent = this.html.replace(/\$C/, String(this.timer));
    }
    return false;
  }

  updatePos(position: number): number {
    this.element.style.bottom = `${position}px`;
    return position + this.height + 10;
  }
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messages: Message[] = [];
  private container?: HTMLElement;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.intervalId !== undefined) {
        clearInterval(this.intervalId);
      }
    });
  }

  show(options: MessageOptions = {}): Message {
    const {
      type = 'info',
      timer = 8,
      html = '-',
      locked = false,
      clickCallback,
      counterCallback,
    } = options;
    const startTimer = locked ? Number.MAX_SAFE_INTEGER : timer;
    const message = new Message(
      this.ensureContainer(),
      type,
      startTimer,
      startTimer,
      html,
      clickCallback,
      counterCallback,
    );

    this.messages.push(message);
    this.resetPositions();
    this.startTimer();
    return message;
  }

  info(html: string, timer = 2): Message {
    return this.show({ timer, html });
  }

  warning(html: string): Message {
    return this.show({ type: 'warning', html });
  }

  error(html: string): Message {
    return this.show({ type: 'error', html });
  }

  locked(
    html: string,
    callback?: () => void,
    type: MessageType = 'warning',
  ): Message {
    return this.show({
      type,
      html,
      locked: true,
      clickCallback: callback,
    });
  }

  counter(html: string, timer: number, callback?: () => void): Message {
    return this.show({
      timer,
      type: 'warning',
      html,
      counterCallback: callback,
    });
  }

  private ensureContainer(): HTMLElement {
    if (this.container) {
      return this.container;
    }

    this.addStyles();
    this.container = this.document.createElement('div');
    this.container.id = 'idMessages';
    this.document.body.append(this.container);
    return this.container;
  }

  private addStyles(): void {
    if (this.document.getElementById('messages-styles')) {
      return;
    }

    const style = this.document.createElement('style');
    style.id = 'messages-styles';
    style.textContent = `
#idMessages {
    position: fixed;
    height: auto;
    right: 0rem;
    bottom: 1rem;
    width: 300px;
    z-index: 2555;
    cursor: pointer;
}

#idMessages div.message {
    width: 300px;
    color: black;
    padding: 1rem;
    transition: all 1s ease-in-out 0s;
    position: absolute;
    font-size: 16pt;
    right: 1rem;
}

#idMessages div.message_close {
    color: rgba(0,0,0,0);
    box-shadow: 5px 5px 5px rgba(0,0,0,0);
    background-color: rgba(255,255,255,0);
}

#idMessages div.message_info {
    background-color: rgba(212,212,255,1);
}

#idMessages div.message_warning {
    background-color: rgba(255,255,192,1);
}

#idMessages div.message_error {
    background-color: rgba(255,192,192,1);
}
    `;
    this.document.head.append(style);
  }

  private startTimer(): void {
    if (this.intervalId !== undefined) {
      return;
    }

    this.intervalId = setInterval(() => {
      let positionsChanged = false;
      for (let index = this.messages.length - 1; index >= 0; index--) {
        if (this.messages[index].tick()) {
          this.messages.splice(index, 1);
          positionsChanged = true;
        }
      }

      if (positionsChanged) {
        this.resetPositions();
      }
      if (this.messages.length === 0 && this.intervalId !== undefined) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    }, 1000);
  }

  private resetPositions(): void {
    let position = 0;
    for (const message of this.messages) {
      position = message.updatePos(position);
    }
  }
}
