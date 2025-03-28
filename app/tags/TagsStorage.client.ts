import type { TagColorsStorage } from '@shlinkio/shlink-web-component';

function diffObjects(obj1: Record<string, string>, obj2: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  Object.keys(obj2).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(obj1, key) || obj1[key] !== obj2[key]) {
      result[key] = obj2[key];
    }
  });

  return result;
}

export class TagsStorage implements TagColorsStorage {
  #colors: Record<string, string>;
  readonly #saveEndpoint: string;
  readonly #fetch: typeof globalThis.fetch;

  constructor(
    colors: Record<string, string>,
    saveEndpoint: string,
    fetch = globalThis.fetch.bind(globalThis),
  ) {
    this.#colors = colors;
    this.#saveEndpoint = saveEndpoint;
    this.#fetch = fetch;
  }

  getTagColors(): Record<string, string> {
    // Return a copy, as ShlinkWebComponent mutates provided reference
    return { ...this.#colors };
  }

  storeTagColors(colors: Record<string, string>): void {
    const changedColors = diffObjects(this.#colors, colors);
    this.#colors = { ...colors };

    // Do not call server if there are no changed colors
    if (Object.keys(changedColors).length === 0) {
      return;
    }

    this.#fetch(this.#saveEndpoint, {
      method: 'POST',
      body: JSON.stringify(changedColors),
      headers: { 'Content-Type': 'application/json' },
    }).catch(console.error); // TODO Handle error
  }
}
