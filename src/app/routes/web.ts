import { Router } from "../../framework/Http/Router/Router";
import { response, jsonResponse } from "../../framework/Http/Response";

export const registerRoutes = async (router: Router): Promise<void> => {
  router.get("/", () => response("Hello World!"));
  router.get("/old-home", () => router.redirect("/"));
  router.get("/has-server-error", () => {
    throw new Error("Oops!");
  });
  router.get("/has-validation-error", () => router.dispatchNotAllowed());
  router.get("/json", () => jsonResponse({ message: "Hello World!" }));
};
