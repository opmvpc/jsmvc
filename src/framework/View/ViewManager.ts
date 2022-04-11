import { fstatSync } from "fs";
import { Engine } from "./Engine";
import { View } from "./View";
const pathManager = require("path");
const fs = require("fs");

export class ViewManager {
  private _paths: string[];
  private _engine: Engine;
  private _macros: Map<string, CallableFunction>;
  private _templates: Map<string, string>;
  private _cacheDir: string;

  constructor(cacheDir: string) {
    this._paths = [];
    this._engine = new Engine();
    this._engine.setManager(this);
    this._macros = new Map();
    this._templates = new Map();
    this._cacheDir = cacheDir;
    this.emptyCacheDir();
  }

  public addPath(path: string): this {
    this._paths.push(path);
    return this;
  }

  public async resolve(template: string, data: {} = {}): Promise<string> {
    const hash = this.hashName(template);
    const filePath = this.resolvePath(template);
    if (!this._templates.has(hash)) {
      const compiledView = this._engine.render(
        new View(filePath, data, template)
      );
      return compiledView;
    }
    const code = await this.readCachedTemplate(this._templates.get(hash)!);

    return this._engine.executeCode(code, data, hash);
  }

  public readCachedTemplate(cachedTemplatePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(cachedTemplatePath, "utf8", (err: any, code: string) => {
        if (err) {
          reject(err);
        }
        resolve(code);
      });
    });
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
    const fileName = pathManager.resolve(this._cacheDir, hash + ".js");
    fs.writeFileSync(fileName, code);
    this._templates.set(hash, fileName);
  }

  public emptyCacheDir(): void {
    this.deleteCacheDir();
    this.ensureFolderExists(this._cacheDir);
    // fs.readdirSync(this._cacheDir).forEach((file: string) => {
    //   fs.unlinkSync(pathManager.resolve(this._cacheDir, file));
    // });
    this._templates.clear();
  }

  private deleteCacheDir(): void {
    try {
      fs.rmSync(this._cacheDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private ensureFolderExists(path: string, mask: number = 0o755): void {
    try {
      fs.mkdirSync(path, mask);
    } catch (error: any) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }

  public get cacheDir(): string {
    return this._cacheDir;
  }
}
