import { HttpContext } from "./HttpContext/HttpContext";
import { storage } from "./HttpContext/LocalStorage/LocalStorage";
import { Router } from "./Router/Router";

export class Server {
  private _router: Router;

  constructor() {
    this._router = new Router();
  }

  get router() {
    return this._router;
  }

  create() {
    const http = require("http");
    const router = this._router;

    return http.createServer(function (req: any, res: any) {
      const state = new HttpContext(req, res);
      return storage.run(state, async () => {
        await router.dispatch();
      });
    });
  }

  start() {
    this.create().listen(process.env.PORT || 8000);
  }
}
