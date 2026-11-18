export interface KeyRecord {
  key: number;
  value: string;
}

export type KeyProviderType = 'albums' | 'artists';

export class KeyProvider {
  private keyList: KeyRecord[] | undefined;
  private keyListRequest: Promise<KeyRecord[]> | undefined;

  constructor(private readonly type: KeyProviderType) {}

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

  private async loadKeyList(): Promise<KeyRecord[]> {
    const response = await fetch(`/api/${this.type}/keys`);

    if (!response.ok) throw new Error('KEY_FETCH_ERROR');

    return response.json() as Promise<KeyRecord[]>;
  }
}