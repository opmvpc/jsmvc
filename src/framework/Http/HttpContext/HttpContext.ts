import CoBody from "co-body";
import { ViewManager } from "../../View/ViewManager";
import { Route } from "../Router/Route";
import { storage } from "./LocalStorage/LocalStorage";

export class HttpContext {
  private _currentRoute?: Route;
  private _post: { [key: string]: any };
  private _query: { [key: string]: any };

  constructor(
    private _request: any,
    private _response: any,
    private _viewManager: ViewManager
  ) {
    this._post = {};
    this._query = {};
  }

  static get(): HttpContext | undefined {
    return storage.getStore();
  }

  get request() {
    return this._request;
  }

  get response() {
    return this._response;
  }

  get currentRoute(): Route | undefined {
    return this._currentRoute;
  }

  set currentRoute(route: Route | undefined) {
    this._currentRoute = route;
  }

  get viewManager(): ViewManager {
    return this._viewManager;
  }

  async parseReqBody(): Promise<void> {
    if (this.request.method === "POST") {
      this._post = await CoBody(this.request);
    }
  }

  parseQueryString(): void {
    const queryString = require("querystring");
    const url = require("url");
    this._query = queryString.parse(url.parse(this._request.url).query);
  }

  get query(): { [key: string]: any } {
    return this._query;
  }

  get post(): { [key: string]: any } {
    return this._post;
  }

  get all(): { [key: string]: any } {
    return { ...this.post, ...this.query };
  }
}
