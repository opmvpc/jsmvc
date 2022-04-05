"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Response_1 = require("../../../Http/Response");
const Router_1 = require("../../../Http/Router/Router");
const Server_1 = require("../../../Http/Server");
const supertest = require("supertest");
describe("Error handling", () => {
    it("should replace error handler", async () => {
        const server = new Server_1.Server();
        server.router.get("/", () => {
            throw new Error("Oops!");
        });
        const res = await supertest(server.create()).get("/");
        expect(res.status).toBe(500);
        expect(res.text).toContain("Error: Oops!");
        server.router.setErrorHandler(500, () => (0, Response_1.response)("Error: not Oops", 500));
        const res2 = await supertest(server.create()).get("/");
        expect(res2.status).toBe(500);
        expect(res2.text).toBe("Error: not Oops");
    });
    it("should detect not allowed error", async () => {
        const server = new Server_1.Server();
        server.router.post("/", () => (0, Response_1.response)("Hello World!"));
        const res = await supertest(server.create()).get("/");
        expect(res.status).toBe(400);
        expect(res.text).toBe("Method not allowed");
    });
    it("should dispatch error", async () => {
        const server = new Server_1.Server();
        server.router.get("/", () => server.router.dispatchError());
        const res = await supertest(server.create()).get("/");
        expect(res.status).toBe(500);
        expect(res.text).toBe("Server error");
    });
});
describe("Routes generation", () => {
    it("should return route without parameters", async () => {
        const router = new Router_1.Router();
        router.get("/", () => (0, Response_1.response)("Hello World!")).setName("home");
        let path = router.route("home");
        expect(path).toBe("/");
        router.get("/test", () => (0, Response_1.response)("Hello World!")).setName("test");
        path = router.route("test");
        expect(path).toBe("/test/");
    });
    it("should return route with required parameters", async () => {
        const router = new Router_1.Router();
        router.get("/user/{id}", () => (0, Response_1.response)("Hello World!")).setName("home");
        let path = router.route("home", { id: 1 });
        expect(path).toBe("/user/1/");
        router
            .get("/user/{id}/name/{name}", () => (0, Response_1.response)("Hello World!"))
            .setName("test");
        path = router.route("test", { id: 1, name: "me" });
        expect(path).toBe("/user/1/name/me/");
    });
    it("should return route with optional parameters", async () => {
        const router = new Router_1.Router();
        router.get("/user/{id?}", () => (0, Response_1.response)("Hello World!")).setName("home");
        let path = router.route("home", { id: 1 });
        expect(path).toBe("/user/1/");
        router
            .get("/user/{id}/name/{name?}", () => (0, Response_1.response)("Hello World!"))
            .setName("test");
        path = router.route("test", { id: 1 });
        expect(path).toBe("/user/1/name/");
        path = router.route("test", { id: 1, name: "me" });
        expect(path).toBe("/user/1/name/me/");
    });
    it("throw error if required parameter is missing", async () => {
        const router = new Router_1.Router();
        router.get("/user/{id}", () => (0, Response_1.response)("Hello World!")).setName("home");
        expect(() => router.route("home")).toThrowError("Missing required parameter: id");
    });
});
