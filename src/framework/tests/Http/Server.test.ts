import { HttpContext } from "../../Http/HttpContext/HttpContext";
import { response, jsonResponse } from "../../Http/Response";
import { Server } from "../../Http/Server";

const supertest = require("supertest");

describe("Server is responding correctly", () => {
  it("should return home page", async () => {
    const server = new Server();
    server.router.get("/", () => response("Hello World!"));
    const res = await supertest(server.create()).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello World!");
  });

  it("should return json", async () => {
    const server = new Server();
    server.router.get("/", () => jsonResponse({ message: "Hello World!" }));
    const res = await supertest(server.create())
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body.message).toEqual("Hello World!");
  });

  it("should return server error", async () => {
    const server = new Server();
    server.router.get("/", () => {
      throw new Error("Oops!");
    });
    const res = await supertest(server.create()).get("/").expect(500);
    expect(res.text).toContain("Error: Oops!");
  });

  it("should return 404", async () => {
    const server = new Server();
    const res = await supertest(server.create()).get("/not-found");
    expect(res.status).toBe(404);
    expect(res.text).toBe("Not found");
  });

  it("should redirect", async () => {
    const server = new Server();
    server.router.get("/test", () => server.router.redirect("/"));
    const res = await supertest(server.create()).get("/test");
    expect(res.status).toBe(302);
    expect(res.header.location).toBe("/");
  });

  it("should pass context to handler", async () => {
    const server = new Server();
    server.router.add("GET", "/products/view/{product}", (ctx: HttpContext) => {
      return response(
        `Viewing product ${ctx.currentRoute?.params.get("product")}`
      );
    });
    const res = await supertest(server.create()).get(
      "/products/view/product-1"
    );
    expect(res.status).toBe(200);
    expect(res.text).toBe("Viewing product product-1");
  });
});
