import { Engine } from "./Engine";
import { View } from "./View";
const pathManager = require("path");
const fs = require("fs");

export class ViewManager {
  private _paths: string[];
  private _engine: Engine;
  private _macros: Map<string, CallableFunction>;
  private _templates: Map<string, string>;

  constructor() {
    this._paths = [];
    this._engine = new Engine();
    this._engine.setManager(this);
    this._macros = new Map();
    this._templates = new Map();
  }

  public addPath(path: string): this {
    this._paths.push(path);
    return this;
  }

  public resolve(template: string, data: {} = {}): string {
    const filePath = this.resolvePath(template);
    const compiledView = this._engine.render(
      new View(filePath, data, template)
    );
    this._templates.set(template, compiledView);
    return compiledView;
  }

  public resolvePath(template: string): string {
    const templateName = template.replace(/\./g, "/");
    for (const path of this._paths) {
      const filePath = pathManager.resolve(path, templateName + ".html");
      //check if file exists
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    throw new Error(`Template '${template}' not found`);
  }

  public addMacro(name: string, macro: CallableFunction): this {
    this._macros.set(name, macro);
    return this;
  }

  public get macros(): Map<string, CallableFunction> {
    return this._macros;
  }
}
