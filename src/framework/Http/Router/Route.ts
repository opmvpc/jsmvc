export class Route {
  constructor(
    private _method: string,
    private _path: string,
    private _handler: CallableFunction
  ) {}

  get path(): string {
    return this._path;
  }

  get method(): string {
    return this._method;
  }

  get handler(): CallableFunction {
    return this._handler;
  }

  matches(method: string, path: string): boolean {
    return this._method === method && this._path === path;
  }

  dispatch(): any {
    return this._handler();
  }
}
