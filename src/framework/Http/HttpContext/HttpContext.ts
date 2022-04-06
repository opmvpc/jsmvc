import { ViewManager } from "../../View/ViewManager";
import { Route } from "../Router/Route";
import { storage } from "./LocalStorage/LocalStorage";

export class HttpContext {
  private _currentRoute?: Route;
  constructor(
    private _request: any,
    private _response: any,
    private _viewManager: ViewManager
  ) {}

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
}
