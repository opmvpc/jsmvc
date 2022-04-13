import path from "path";
import { Engine } from "../../../src/framework/View/Engine";
import { ViewManager } from "../../../src/framework/View/ViewManager";

const setupViewManager = (): ViewManager => {
  const viewManager = new ViewManager(path.resolve(__dirname, "./cache"));
  viewManager.addPath(path.resolve(__dirname, "test_templates"));
  return viewManager;
};

describe("Simple rendering", () => {
  it("should return empty string", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("static_templates/empty")).toEqual("");
  });

  it("should return input", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("static_templates.hello")).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>`
    );
  });

  it("should render a simple view", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("hello-world", { name: "World" })).toEqual(
      `<h1>Hello World</h1>`
    );
  });

  it("should preserve space characters in data values", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("hello-world", { name: "\nWorld" })
    ).toEqual(`<h1>Hello &#10;World</h1>`);
  });

  it("should compile if statements", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("single-if", { name: "World" })).toEqual(
      "Hello World "
    );
  });

  it("should compile if statements with else", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("if-else", { name: false })).toEqual(
      "Hello Universe "
    );
  });

  it("should compile if statements with else if", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("if-elseif", { name: false, age: 12 })
    ).toEqual("Hello Universe ");
  });

  it("should compile simple for loop", async () => {
    const viewManager = setupViewManager();

    expect(await viewManager.resolve("for", { items: ["World", "Universe"] }))
      .toEqual(`<ul>
  <li>World</li>
  <li>Universe</li>
  </ul>`);
  });

  it("should throw an error if a template is not found", async () => {
    const viewManager = setupViewManager();

    await expect(() => viewManager.resolve("not-found")).rejects.toThrowError(
      "Template 'not-found' not found"
    );
  });

  it("should render a layout and it's content", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("with-layout", { name: "<h1>Hello World</h1>" })
    ).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    &#60;h1&#62;Hello World&#60;&#47;h1&#62;
  </body>
</html>`
    );
  });

  it("should include and render content", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("include.include", { name: "hello-world" })
    ).toEqual(`<section><h1>Include</h1>
<p>hello&#45;world</p></section>`);
  });

  it("should escape html", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("escape", {
        name: "<script>alert('hello')</script>",
      })
    ).toEqual(`<div>
  <h1>&#60;script&#62;alert&#40;&#39;hello&#39;&#41;&#60;&#47;script&#62;</h1>
</div>`);
  });

  it("should not escape html", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("no-escape", {
        name: "<script>alert('hello')</script>",
      })
    ).toEqual(`<div>
  <h1><script>alert('hello')</script></h1>
</div>`);
  });

  it("should render mixed templates", async () => {
    const viewManager = setupViewManager();

    expect(
      await viewManager.resolve("mixed", {
        users: [
          { name: "Jean Bauche", role: "admin" },
          { name: "Eli Kopter", role: "guest" },
        ],
      })
    ).toEqual(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    <div>
  <div>
    <h1>Jean Bauche</h1>
    <h2>admin</h2>
    </div>
  <div>
    <h1>Eli Kopter</h1>
    </div>
  </div>
  </body>
</html>`
    );
  });
});

describe("Macros", () => {
  it("should use a registered macro", async () => {
    const viewManager = setupViewManager();

    viewManager.addMacro("hello", (name) => `Hello ${name}`);
    expect(
      await viewManager.resolve("macros.hello", { name: "World" })
    ).toEqual(`Hello World`);
  });

  it("should use a registered macro using directive syntax", async () => {
    const viewManager = setupViewManager();

    viewManager.addMacro("hello", (name) => `Hello ${name}`);
    expect(
      await viewManager.resolve("macros.hello-directive", { name: "World" })
    ).toEqual(`Hello World`);
  });

  it("should throw an error if a macro is not found", async () => {
    const viewManager = setupViewManager();

    await expect(() =>
      viewManager.resolve("macros.not-found", { name: "World" })
    ).rejects.toThrowError(
      "Error in view 'macros.not-found': TypeError: this.notFound is not a function"
    );
  });
});

describe("View cache", () => {
  it("should cache a view", async () => {
    const viewManager = setupViewManager();

    await viewManager.resolve("hello-world", { name: "World" });
    const fs = require("fs");
    const path = require("path");
    const hash = viewManager.hashName("hello-world");
    const filePath = path.resolve(viewManager.cacheDir, hash + ".js");
    expect(fs.existsSync(filePath)).toBeTruthy();
  });

  it("should use cache", async () => {
    const viewManager = setupViewManager();
    await viewManager.resolve("hello-world", { name: "World" });
    await viewManager.resolve("hello-world", { name: "World" });
  });
});

describe("Files handling errors", () => {
  it("should throw an error if path does not exists when writing", async () => {
    const viewManager = setupViewManager();
    viewManager.cacheDir = "/does/not/exist";
    await expect(() =>
      viewManager.putCodeInCache("does/not/exist", "")
    ).rejects.toThrowError(/ENOENT: no such file or directory, open/);
  });

  it("should throw an error if path does not exists when creating cache folder", () => {
    const viewManager = setupViewManager();
    expect(() =>
      viewManager.ensureFolderExists("/does/not/exist")
    ).toThrowError(
      "ENOENT: no such file or directory, mkdir '/does/not/exist'"
    );
  });

  it("should throw an error if a cached view path does not exist", async () => {
    const viewManager = setupViewManager();
    await expect(
      viewManager.readCachedTemplate("/does/not/exist")
    ).rejects.toThrowError(/ENOENT: no such file or directory, open/);
  });

  it("should throw an error if a cached view path does not exist while reading", async () => {
    const engine = new Engine();
    await expect(
      engine.readTemplateFile("/does/not/exist")
    ).rejects.toThrowError(/ENOENT: no such file or directory, open/);
  });
});
