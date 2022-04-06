import { Engine } from "./Engine";
import { View } from "./View";
const pathManager = require("path");
const fs = require("fs");

export class ViewManager {
  private paths: string[];
  private engine: Engine;

  constructor() {
    this.paths = [];
    this.engine = new Engine();
  }

  public addPath(path: string): this {
    this.paths.push(path);
    return this;
  }

  public resolve(template: string, data: {} = {}): string {
    for (const path of this.paths) {
      const filePath = pathManager.resolve(path, template + ".html");
      //check if file exists
      if (fs.existsSync(filePath)) {
        return this.engine.render(new View(filePath, data));
      }
    }
    throw new Error("Template not found");
  }
}
