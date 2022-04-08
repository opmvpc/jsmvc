import { Engine } from "./Engine";
import { View } from "./View";
const pathManager = require("path");
const fs = require("fs");

export class ViewManager {
  private _paths: string[];
  private _engine: Engine;
  private _macros: Map<string, CallableFunction>;
  private _templates: Map<string, string>;

  public readonly VIEWCACHEDIR = "../../../storage/framework/cache/views";

  constructor() {
    this._paths = [];
    this._engine = new Engine();
    this._engine.setManager(this);
    this._macros = new Map();
    this._templates = new Map();
    this.emptyCacheDir();
  }

  public addPath(path: string): this {
    this._paths.push(path);
    return this;
  }

  public resolve(template: string, data: {} = {}): string {
    const hash = this.hashName(template);
    const filePath = this.resolvePath(template);
    if (!this._templates.has(hash)) {
      const compiledView = this._engine.render(
        new View(filePath, data, template)
      );
      return compiledView;
    }
    const code = fs.readFileSync(this._templates.get(hash), "utf8");
    return this._engine.executeCode(code, data, hash);
  }

  public hashName(template: string): string {
    const crypto = require("crypto");
    return crypto.createHash("md5").update(template).digest("hex");
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

  public putCodeInCache(templateName: string, code: string): void {
    const hash = this.hashName(templateName);
    //save code in a cache file
    const fileName = pathManager.resolve(
      __dirname,
      this.VIEWCACHEDIR,
      hash + ".js"
    );
    fs.writeFileSync(fileName, code);
    this._templates.set(hash, fileName);
  }

  public emptyCacheDir(): void {
    const dirPath = pathManager.resolve(__dirname, this.VIEWCACHEDIR);

    fs.readdirSync(dirPath).forEach((file: string) => {
      fs.unlinkSync(pathManager.resolve(dirPath, file));
    });
    this._templates.clear();
  }
}
