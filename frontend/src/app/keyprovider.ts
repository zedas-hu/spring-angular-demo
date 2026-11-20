import { ApiService } from './api.service';

export interface KeyRecord {
  key: number;
  value: string;
}

export type KeyProviderType = 'albums' | 'artists';

export class KeyProvider {
  private keyList: KeyRecord[] | undefined;
  private keyListRequest: Promise<KeyRecord[]> | undefined;

  constructor(
    private readonly api: ApiService,
    private readonly type: KeyProviderType,
  ) {}

  getKeyList(): Promise<KeyRecord[]> {
    if (this.keyList !== undefined)
      return Promise.resolve(this.keyList);

    if (this.keyListRequest === undefined)
      this.keyListRequest = this.loadKeyList()
        .then((keyList) => {
          this.keyList = keyList;
          return keyList;
        })
        .catch((error: unknown) => {
          this.keyListRequest = undefined;
          throw error;
        });

    return this.keyListRequest;
  }

  private loadKeyList(): Promise<KeyRecord[]> {
    return this.api.request<KeyRecord[]>('GET', `/api/${this.type}/keys`, {
      fallbackError: 'KEY_FETCH_ERROR',
    });
  }
}