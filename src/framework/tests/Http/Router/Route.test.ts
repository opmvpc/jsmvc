import { HttpContext } from "../../../Http/HttpContext/HttpContext";
import { Route } from "../../../Http/Router/Route";

describe("Path normalization", () => {
  it("should return /", () => {
    expect(Route.normalizePath("/")).toBe("/");
    expect(Route.normalizePath("")).toBe("/");
    expect(Route.normalizePath("//")).toBe("/");
  });

  it("should return /about/", () => {
    expect(Route.normalizePath("/about")).toBe("/about/");
    expect(Route.normalizePath("about")).toBe("/about/");
    expect(Route.normalizePath("about/")).toBe("/about/");
    expect(Route.normalizePath("/about/")).toBe("/about/");
    expect(Route.normalizePath("/about//")).toBe("/about/");
  });
});

describe("Route matching", () => {
  it("should match required parameters", () => {
    const route = new Route("GET", "/products/view/{product}", () => {});
    expect(route.matches("GET", "/products/view/")).toEqual(false);
    expect(route.matches("GET", "/products/view/product-1")).toEqual(true);
    expect(route.matches("GET", "/products/view/product-1/")).toEqual(true);
    expect(route.matches("GET", "/products/view/product-1/extra")).toEqual(
      true
    );
  });

  it("should not match empty parameters", () => {
    const route = new Route("GET", "/products/view/{}", () => {});
    expect(route.matches("GET", "/products/view/product-1")).toEqual(false);
    expect(route.matches("GET", "/products/view/product-1/")).toEqual(false);
  });

  it("should match optional parameters", () => {
    const route = new Route("GET", "/products/view/{product?}", () => {});
    expect(route.matches("GET", "/products/view")).toEqual(true);
    expect(route.matches("GET", "/products/view/")).toEqual(true);
    expect(route.matches("GET", "/products/view/product-1")).toEqual(true);
    expect(route.matches("GET", "/products/view/product-1/")).toEqual(true);
    expect(route.matches("GET", "/products/view/product-1/extra")).toEqual(
      true
    );
  });

  it("should get required parameters names and values", () => {
    const route = new Route(
      "GET",
      "/products/view/{product}/id/{id}",
      () => {}
    );
    route.matches("GET", "/products/view/product-1/id/1");
    expect(route.params.get("product")).toEqual("product-1");
    expect(route.params.get("id")).toEqual(1);
  });

  it("should get optional parameters names and values", () => {
    const route = new Route(
      "GET",
      "/products/view/{product?}/id/{id?}",
      () => {}
    );
    route.matches("GET", "/products/view/product-1/id/1");
    expect(route.params.get("product")).toEqual("product-1");
    expect(route.params.get("id")).toEqual(1);
    route.matches("GET", "/products/view/product-1/id/");
    expect(route.params.get("product")).toEqual("product-1");
    expect(route.params.get("id")).toEqual(null);
    route.matches("GET", "/products/view/id/1");
    expect(route.params.get("product")).toEqual(null);
    expect(route.params.get("id")).toEqual(1);
  });

  it("should get optional and required parameters names and values", () => {
    const route = new Route(
      "GET",
      "/products/view/{product}/id/{id?}",
      () => {}
    );
    route.matches("GET", "/products/view/product-1/id/1");
    expect(route.params.get("product")).toEqual("product-1");
    expect(route.params.get("id")).toEqual(1);
    route.matches("GET", "/products/view/product-1/id/");
    expect(route.params.get("product")).toEqual("product-1");
    expect(route.params.get("id")).toEqual(null);
  });
});

describe("Route can be named", () => {
  it("should be named", () => {
    const route = new Route(
      "GET",
      "/products/view/{product}",
      () => {}
    ).setName("products.view");
    expect(route.name).toEqual("products.view");
  });
});
