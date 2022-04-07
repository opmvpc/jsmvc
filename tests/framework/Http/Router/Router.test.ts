import { response } from "../../../../src/framework/Http/Response";
import { Router } from "../../../../src/framework/Http/Router/Router";
import { Server } from "../../../../src/framework/Http/Server";
const supertest = require("supertest");

describe("Error handling", () => {
  it("should replace error handler", async () => {
    const server = new Server();
    server.router.get("/", () => {
      throw new Error("Oops!");
    });
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toContain("Error: Oops!");

    server.router.setErrorHandler(500, () => response("Error: not Oops", 500));
    const res2 = await supertest(server.create()).get("/");
    expect(res2.status).toBe(500);
    expect(res2.text).toBe("Error: not Oops");
  });

  it("should detect not allowed error", async () => {
    const server = new Server();
    server.router.post("/", () => response("Hello World!"));
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Method not allowed");
  });

  it("should dispatch error", async () => {
    const server = new Server();
    server.router.get("/", () => server.router.dispatchError());
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toBe("Server error");
  });
});

describe("Routes generation", () => {
  it("should return route without parameters", async () => {
    const router = new Router();
    router.get("/", () => response("Hello World!")).setName("home");
    let path: string = router.route("home");
    expect(path).toBe("/");

    router.get("/test", () => response("Hello World!")).setName("test");
    path = router.route("test");
    expect(path).toBe("/test/");
  });

  it("should return route with required parameters", async () => {
    const router = new Router();
    router.get("/user/{id}", () => response("Hello World!")).setName("home");
    let path: string = router.route("home", { id: 1 });
    expect(path).toBe("/user/1/");

    router
      .get("/user/{id}/name/{name}", () => response("Hello World!"))
      .setName("test");
    path = router.route("test", { id: 1, name: "me" });
    expect(path).toBe("/user/1/name/me/");
  });

  it("should return route with optional parameters", async () => {
    const router = new Router();
    router.get("/user/{id?}", () => response("Hello World!")).setName("home");
    let path: string = router.route("home", { id: 1 });
    expect(path).toBe("/user/1/");

    router
      .get("/user/{id}/name/{name?}", () => response("Hello World!"))
      .setName("test");
    path = router.route("test", { id: 1 });
    expect(path).toBe("/user/1/name/");
    path = router.route("test", { id: 1, name: "me" });
    expect(path).toBe("/user/1/name/me/");
  });

  it("throw error if required parameter is missing", async () => {
    const router = new Router();
    router.get("/user/{id}", () => response("Hello World!")).setName("home");
    expect(() => router.route("home")).toThrowError(
      "Missing required parameter: id"
    );
  });
});
