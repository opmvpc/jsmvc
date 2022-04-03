"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const Response_1 = require("../../framework/Http/Response");
const registerRoutes = async (router) => {
    router.get("/", () => (0, Response_1.response)("Hello World!"));
    router.get("/old-home", () => router.redirect("/"));
    router.get("/has-server-error", () => {
        throw new Error("Oops!");
    });
    router.get("/has-validation-error", () => router.dispatchNotAllowed());
    router.get("/json", () => (0, Response_1.jsonResponse)({ message: "Hello World!" }));
};
exports.registerRoutes = registerRoutes;
