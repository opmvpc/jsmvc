import { View } from "./View";
import { ViewManager } from "./ViewManager";
const fs = require("fs");

export class Engine {
  private _manager: ViewManager | null;

  private static readonly TOKENS_REGEX =
    /\{\{([^}]+)\}\}|\{\!\!([^!]+)\!\!\}|(@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else)\s*/g;
  private static readonly INCLUDE_REGEX = /@include\s*\(([^\)]+)\)/;
  private static readonly IF_REGEX = /@if\s*\(([^\)]+)\)/;
  private static readonly ELSE_REGEX = /@else\s*/;
  private static readonly ELSEIF_REGEX = /@elseif\s*\(([^\)]+)\)/;
  private static readonly ENDIF_REGEX = /@endif/;
  private static readonly FOR_REGEX = /@for\s*\(([^\)]+)\)/;
  private static readonly ENDFOR_REGEX = /@endfor/;
  private static readonly EXTENDS_REGEX = /@extends\s*\(([^\)]+)\)/;
  private static readonly MACRO_REGEX = /@([^\(]+)\s*\(([^\)]+)\)/;

  constructor() {
    this._manager = null;
  }

  public setManager(manager: ViewManager) {
    this._manager = manager;
  }

  /**
   *
   * @param view view to render
   * @returns string of rendered html
   */
  public render(view: View): string {
    const template: string = fs.readFileSync(view.template, "utf8");
    const code = this.compile(template, view);

    return this.executeCode(code, view);
  }

  public compile(template: string, view: View): string {
    let tokens: string[] = this.getTokens(template);
    let code: string = this.generateCode(tokens, view.data);
    let { layoutPath, layoutName } = this.getLayoutPathAndName(template);
    if (layoutPath !== "") {
      return this.renderViewWithLayout(code, view, layoutPath, layoutName);
    }
    return code;
  }

  private renderViewWithLayout(
    code: string,
    view: View,
    layoutPath: string,
    templateName: string
  ): string {
    const content = this.executeCode(code, view);
    const layoutView = new View(
      layoutPath,
      {
        content: content,
      },
      templateName
    );
    return this.addText(this.render(layoutView));
  }

  private generateCode(tokens: string[], data: { [k: string]: any }) {
    let code = "";
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (Engine.INCLUDE_REGEX.test(token)) {
        code += this.include(token, data);
      } else if (token.startsWith("@")) {
        code += this.addDirective(token);
      } else if (token.startsWith("{{")) {
        code += this.addEscapedValue(token.slice(2, token.length - 2));
      } else if (token.startsWith("{!!")) {
        code += this.addValue(token.slice(3, token.length - 3));
      } else {
        code += this.addText(token);
      }
    }
    return code;
  }

  private include(line: string, data: { [k: string]: any }): string {
    // include partial
    let match = line.match(Engine.INCLUDE_REGEX);
    if (match !== null) {
      let [partialTemplate, partialData] = match[1].split(",");
      partialTemplate = partialTemplate.replace(/['"]+/g, "");
      partialData = JSON.parse(JSON.stringify(partialData));
      const partialDataObject: { [k: string]: any } = new Function(
        "return " + partialData
      ).apply(data);
      const partialPath = this._manager?.resolvePath(partialTemplate);
      const partialView = new View(
        partialPath!,
        partialDataObject,
        partialTemplate
      );
      return this.addText(this.render(partialView));
    }
    return "";
  }

  private getTokens(template: string) {
    const tokensRegex = Engine.TOKENS_REGEX;
    let cursor = 0;
    let match;
    let tokens = [];
    while ((match = tokensRegex.exec(template)) !== null) {
      tokens.push(template.slice(cursor, match.index));
      tokens.push(match[0]);
      cursor = match.index + match[0].length;
    }

    const endOfTemplate = template.slice(cursor).trimEnd();
    tokens.push(endOfTemplate);

    return tokens;
  }

  public executeCode(code: string, view: View) {
    code = "const r=[];" + code + "return r.join('');";
    let data: { [k: string]: any } = this.addMacrosToViewData(view);
    let html = "";
    try {
      console.log(code);

      html = new Function(code).apply(data);
      html = html.replace(/__r__/g, "\r");
      html = html.replace(/__t__/g, "\t");
      html = html.replace(/__n__/g, "\n");
      console.log(html);

      return html;
    } catch (error) {
      throw new Error(`Error in view '${view.templateName}': ${error}`);
    }
  }

  private addMacrosToViewData(view: View) {
    let data: { [k: string]: any } = view.data;
    data["escape"] = this.escape;
    for (const [key, value] of this._manager!.macros) {
      data[key] = value;
    }
    return data;
  }

  private addText(line: string): string {
    line = line.replace(/\r/g, "__r__");
    line = line.replace(/\t/g, "__t__");
    line = line.replace(/\n/g, "__n__");
    return 'r.push("' + line.replace(/"/g, '\\"') + '");';
  }

  private addValue(line: string): string {
    return "r.push(" + line + ");";
  }

  private addEscapedValue(line: string): string {
    return "r.push(this.escape(" + line + "));";
  }

  /**
   * @info https://gomakethings.com/how-to-sanitize-third-party-content-with-vanilla-js-to-prevent-cross-site-scripting-xss-attacks/#sanitizing-by-encoding
   */
  private escape: CallableFunction = (line: string): string => {
    return line.replace(/[^\w. ]/gi, function (c) {
      return "&#" + c.charCodeAt(0) + ";";
    });
  };

  private addDirective(line: string): string {
    line = line.replace(Engine.IF_REGEX, "if($1){");
    line = line.replace(Engine.ELSE_REGEX, "}else{");
    line = line.replace(Engine.ELSEIF_REGEX, "}else if($1){");
    line = line.replace(Engine.ENDIF_REGEX, "}");

    line = line.replace(Engine.FOR_REGEX, "for($1){");
    line = line.replace(Engine.ENDFOR_REGEX, "}");

    // extends layout
    line = line.replace(Engine.EXTENDS_REGEX, "");

    // call macro by directive
    line = line.replace(Engine.MACRO_REGEX, this.addValue("this.$1($2)"));

    return line;
  }

  private getLayoutPathAndName(template: string): {
    layoutPath: string;
    layoutName: string;
  } {
    const match = template.match(Engine.EXTENDS_REGEX);

    if (match !== null && this._manager !== null) {
      const layout = match[1].replace(/['"]+/g, "");
      return {
        layoutPath: this._manager.resolvePath(layout),
        layoutName: layout,
      };
    }
    return {
      layoutPath: "",
      layoutName: "",
    };
  }
}
