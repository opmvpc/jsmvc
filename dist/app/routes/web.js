"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const Response_1 = require("../../framework/Http/Response");
const ViewHelper_1 = require("../../framework/View/ViewHelper");
const registerRoutes = async (router) => {
    router.get("/", () => (0, ViewHelper_1.view)("hello")).setName("home");
    router.get("/old-home", () => router.redirect("/"));
    router.get("/has-server-error", () => {
        throw new Error("Oops!");
    });
    router.get("/has-validation-error", () => router.dispatchNotAllowed());
    router.get("/json", () => (0, Response_1.jsonResponse)({ message: "Hello World!" }));
    router.get("/products/view/{product}", (ctx) => {
        return (0, Response_1.response)(`Viewing product ${ctx.currentRoute?.params.get("product")}`);
    });
    router.get("/services/view/{service?}", (ctx) => {
        if (ctx.currentRoute?.params.get("service") === null) {
            return (0, Response_1.response)(`All services`);
        }
        return (0, Response_1.response)(`Service is ${ctx.currentRoute?.params.get("service")}`);
    });
};
exports.registerRoutes = registerRoutes;
