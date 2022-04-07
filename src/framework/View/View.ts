export class View {
  constructor(
    private _template: string,
    private _data: { [k: string]: any },
    private _templateName: string
  ) {}

  get template(): string {
    return this._template;
  }

  get data(): {} {
    return this._data;
  }

  get templateName(): string {
    return this._templateName;
  }
}
