import { storage } from "./LocalStorage/LocalStorage";

export class HttpContext {
  constructor(private _request: any, private _response: any) {}
  static get(): HttpContext | undefined {
    return storage.getStore();
  }
  get request() {
    return this._request;
  }
  get response() {
    return this._response;
  }
}
