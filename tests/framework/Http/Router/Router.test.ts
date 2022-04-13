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

describe("Request post parameters", () => {
  it("should save json post parameters in ctx object", async () => {
    const server = new Server();
    server.router
      .post("/", (ctx) =>
        response(`name: ${ctx.post.name} age: ${ctx.post.age}`)
      )
      .setName("home");
    const res = await supertest(server.create())
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        name: "John",
        age: "30",
      });
    expect(res.status).toBe(200);
    expect(res.text).toBe("name: John age: 30");
  });

  it("should save html-encoded parameters in ctx object", async () => {
    const server = new Server();
    server.router
      .post("/", (ctx) =>
        response(`name: ${ctx.post.name} age: ${ctx.post.age}`)
      )
      .setName("home");
    const res = await supertest(server.create()).post("/").type("form").send({
      name: "John",
      age: "30",
    });
    expect(res.status).toBe(200);
    expect(res.text).toBe("name: John age: 30");
  });

  it("should save query string params in ctx object", async () => {
    const server = new Server();
    server.router
      .get("/", (ctx) =>
        response(`name: ${ctx.query.name} age: ${ctx.query.age}`)
      )
      .setName("home");
    const res = await supertest(server.create())
      .get("/?name=John&age=30")
      .send();
    expect(res.status).toBe(200);
    expect(res.text).toBe("name: John age: 30");
  });

  it("should save html-encoded parameters and query string parameters in ctx object", async () => {
    const server = new Server();
    server.router
      .post("/", (ctx) => response(`name: ${ctx.all.name} age: ${ctx.all.age}`))
      .setName("home");
    const res = await supertest(server.create())
      .post("/?age=30")
      .type("form")
      .send({
        name: "John",
      });
    expect(res.status).toBe(200);
    expect(res.text).toBe("name: John age: 30");
  });
});
