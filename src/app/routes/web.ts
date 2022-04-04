import { Router } from "../../framework/Http/Router/Router";
import { response, jsonResponse } from "../../framework/Http/Response";
import { HttpContext } from "../../framework/Http/HttpContext/HttpContext";

export const registerRoutes = async (router: Router): Promise<void> => {
  router.get("/", () => response("Hello World!")).setName("home");
  router.get("/old-home", () => router.redirect("/"));
  router.get("/has-server-error", () => {
    throw new Error("Oops!");
  });
  router.get("/has-validation-error", () => router.dispatchNotAllowed());
  router.get("/json", () => jsonResponse({ message: "Hello World!" }));
  router.get("/products/view/{product}", (ctx: HttpContext) => {
    return response(
      `Viewing product ${ctx.currentRoute?.params.get("product")}`
    );
  });
  router.get("/services/view/{service?}", (ctx: HttpContext) => {
    if (ctx.currentRoute?.params.get("service") === null) {
      return response(`All services`);
    }
    return response(`Service is ${ctx.currentRoute?.params.get("service")}`);
  });
};
