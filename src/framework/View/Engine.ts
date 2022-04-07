import { View } from "./View";
import { ViewManager } from "./ViewManager";
const fs = require("fs");

export class Engine {
  constructor(private _manager: ViewManager) {}

  /**
   *
   * @param view view to render
   * @returns string of rendered html
   */
  render(view: View): string {
    const template: string = fs.readFileSync(view.template, "utf8");

    let tokens: string[] = this.getTokens(template);
    let code: string = this.generateCode(tokens);
    let layoutPath = this.getLayoutPath(template);
    if (layoutPath !== "") {
      return this.renderViewWithLayout(code, view, layoutPath);
    }

    return this.executeCode(code, view);
  }

  private renderViewWithLayout(code: string, view: View, layoutPath: string) {
    const content = this.executeCode(code, view);
    const layoutView = new View(layoutPath, {
      content: content,
    });
    return this.render(layoutView);
  }

  private generateCode(tokens: string[]) {
    let code = "";
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith("@")) {
        code += this.addCode(token);
      } else if (token.startsWith("{{ ")) {
        code += this.addValue(token.slice(2, token.length - 2));
      } else {
        code += this.addText(token);
      }
    }
    return code;
  }

  private getTokens(template: string) {
    const tokensRegex =
      /\{\{([^}]+)\}\}|(@[^\(]+\(([^\)]+)\)|@endif|@endfor|@else)\s*/g;
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

  private executeCode(code: string, view: View) {
    code = "const r=[];" + code + "return r.join('');";
    let html = new Function(code).apply(view.data);
    html = html.replace(/__r__/g, "\r");
    html = html.replace(/__t__/g, "\t");
    html = html.replace(/__n__/g, "\n");
    return html;
  }

  private addText(line: string) {
    line = line.replace(/\r/g, "__r__");
    line = line.replace(/\t/g, "__t__");
    line = line.replace(/\n/g, "__n__");
    return 'r.push("' + line.replace(/"/g, '\\"') + '");';
  }

  private addValue(line: string) {
    return "r.push(" + line + ");";
  }

  private addCode(line: string) {
    line = line.replace(/@if\s*\(([^\)]+)\)/, "if($1){");
    line = line.replace(/@elseif\s*\(([^\)]+)\)/, "}else if($1){");
    line = line.replace(/@else\s*/, "}else{");
    line = line.replace(/@endif/, "}");

    line = line.replace(/@for\s*\(([^\)]+)\)/, "for($1){");
    line = line.replace(/@endfor/, "}");

    line = line.replace(/@extends\s*\(([^\)]+)\)/, "");

    return line;
  }

  public getLayoutPath(template: string): string {
    const match = template.match(/@extends\s*\('([^']+)'\)/);

    if (match !== null) {
      return this._manager.resolvePath(match[1]) ?? "";
    }
    return "";
  }
}
