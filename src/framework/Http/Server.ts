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

    return http.createServer(async (req: any, res: any) => {
      const ctx = await this.buildCtx(req, res, viewManager);
      return storage.run(ctx, async () => {
        await router.dispatch();
      });
    });
  }

  private async buildCtx(
    req: any,
    res: any,
    viewManager: ViewManager
  ): Promise<HttpContext> {
    const ctx = new HttpContext(req, res, viewManager);
    await ctx.parseReqBody();
    ctx.parseQueryString();

    return ctx;
  }
}
