import path from "path";
import { ViewManager } from "../View/ViewManager";
import { HttpContext } from "./HttpContext/HttpContext";
import { storage } from "./HttpContext/LocalStorage/LocalStorage";
import { Router } from "./Router/Router";

export class Server {
  private _router: Router;
  private _viewManager: ViewManager;

  constructor() {
    this._router = new Router();
    this._viewManager = new ViewManager(
      path.resolve(__dirname, "../../../storage/framework/cache/views")
    );
  }

  get router(): Router {
    return this._router;
  }

  get viewManager(): ViewManager {
    return this._viewManager;
  }

  create() {
    const http = require("http");
    const router = this._router;
    const viewManager = this._viewManager;
    this.viewManager.emptyCacheDir();
    return http.createServer(function (req: any, res: any) {
      const state = new HttpContext(req, res, viewManager);
      return storage.run(state, async () => {
        await router.dispatch();
      });
    });
  }
}
