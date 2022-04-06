import { Engine } from "./Engine";

export class View {
  constructor(private _template: string, private _data: {}) {}

  get template(): string {
    return this._template;
  }

  get data(): {} {
    return this._data;
  }
}
