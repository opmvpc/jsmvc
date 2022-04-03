import { registerRoutes } from "../../../app/routes/web";
import { HttpContext } from "../HttpContext/HttpContext";
import { response } from "../Response";
import { Route } from "./Route";

export class Router {
  private routes: Route[];
  private errorHandler: Map<number, CallableFunction>;

  constructor() {
    this.routes = [];
    this.errorHandler = new Map();
    if (process.env.NODE_ENV !== "test") {
      registerRoutes(this);
    }
  }

  add(method: string, path: string, handler: CallableFunction): Route {
    const route = new Route(method, path, handler);
    this.routes.push(route);
    return route;
  }

  get(path: string, handler: CallableFunction): Route {
    return this.add("GET", path, handler);
  }

  post(path: string, handler: CallableFunction): Route {
    return this.add("POST", path, handler);
  }

  public async dispatch() {
    const requestMethod = HttpContext.get()?.request.method ?? "GET";
    const requestPath = HttpContext.get()?.request.url ?? "/";

    const matching = this.match(requestMethod, requestPath);

    if (matching) {
      try {
        return matching.dispatch();
      } catch (error: any) {
        return this.dispatchError(error);
      }
    }

    if (this.paths().includes(requestPath)) {
      return this.dispatchNotAllowed();
    }

    return this.dispatchNotFound();
  }

  match(method: string, path: string): Route | null {
    for (const route of this.routes) {
      if (route.matches(method, path)) {
        return route;
      }
    }
    return null;
  }

  paths(): string[] {
    return this.routes.map((route: Route) => route.path);
  }

  addErrorHandler(code: number, handler: CallableFunction): void {
    this.errorHandler.set(code, handler);
  }

  dispatchNotAllowed(): any {
    if (this.errorHandler.get(400) === undefined) {
      this.errorHandler.set(400, () => response("Method not allowed", 400));
    }
    return this.errorHandler.get(400)?.();
  }

  dispatchNotFound(): any {
    if (this.errorHandler.get(404) === undefined) {
      this.errorHandler.set(404, () => response("Not found", 404));
    }
    return this.errorHandler.get(404)?.();
  }

  dispatchError(error?: Error): any {
    if (this.errorHandler.get(500) === undefined) {
      this.errorHandler.set(500, () => {
        if (error) {
          return response(
            `Server error:
        <br> ${error?.stack}`,
            500
          );
        }
        return response("Server error", 500);
      });
    }
    return this.errorHandler.get(500)?.();
  }

  redirect(path: string) {
    const response = HttpContext.get()?.response;

    response.writeHead(302, {
      location: path,
    });
    response.end();
  }
}
