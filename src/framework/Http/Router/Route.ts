import { HttpContext } from "../HttpContext/HttpContext";

export class Route {
  private _params: Map<string, string | number | null>;
  private _name?: string;

  constructor(
    private _method: string,
    private _path: string,
    private _handler: CallableFunction
  ) {
    this._params = new Map();
  }

  setName(name: string): this {
    this._name = name;
    return this;
  }

  get name(): string | undefined {
    return this._name;
  }

  get path(): string {
    return this._path;
  }

  get method(): string {
    return this._method;
  }

  matches(method: string, path: string): boolean {
    // literal match
    if (this.path === path && this.method === method) {
      return true;
    }

    var { pattern, paramsName }: { pattern: string; paramsName: string[] } =
      this.getParamsNamesAndReplaceNamesByPatterns();

    if (!pattern.includes("+") && !pattern.includes("*")) {
      return false;
    }

    const paramsValues: string[] = this.getParamsValues(pattern, path);

    if (paramsValues.length > 0) {
      this.addParamsToRoute(paramsName, paramsValues);

      return true;
    }

    return false;
  }

  private getParamsNamesAndReplaceNamesByPatterns() {
    const paramsName: string[] = [];
    let pattern = Route.normalizePath(this.path);

    pattern = pattern.replace(/\{([^}]+)\}\//g, (match, key) => {
      paramsName.push(key.replace("?", ""));

      if (key.endsWith("?")) {
        return "([^/]*)(?:/?)";
      }
      return "([^/]+)/";
    });
    return { pattern, paramsName };
  }

  private getParamsValues(pattern: string, path: string) {
    const paramsValues: string[] = [];
    let matches;
    if (
      (matches = new RegExp(pattern).exec(Route.normalizePath(path))) !== null
    ) {
      matches.forEach((match, groupIndex) => {
        if (groupIndex > 0) {
          paramsValues.push(match);
        }
      });
    }
    return paramsValues;
  }

  private addParamsToRoute(paramsName: string[], paramsValues: string[]) {
    for (let i = 0; i < paramsName.length; i++) {
      let value;
      if (paramsValues[i] === "") {
        value = null;
      } else if (/^\d+$/.test(paramsValues[i])) {
        value = parseInt(paramsValues[i]);
      } else {
        value = paramsValues[i];
      }
      this._params.set(paramsName[i], value);
    }
  }

  static normalizePath(path: string): string {
    if (path.startsWith("/")) {
      path = path.substring(1, path.length);
    }

    if (path.endsWith("/")) {
      path = path.substring(0, path.length - 1);
    }

    path = `/${path}/`;

    path = path.replace(/[\/]{2,}/g, "/");

    return path;
  }

  dispatch(): any {
    return this._handler(HttpContext.get());
  }

  get params(): Map<string, string | number | null> {
    return this._params;
  }
}
