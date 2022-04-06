import { View } from "./View";
const fs = require("fs");

export class Engine {
  /**
   *
   * @param view view to render
   * @returns string of rendered html
   */
  render(view: View): string {
    const template: string = fs.readFileSync(view.template, "utf8");

    let tokens: string[] = this.getTokens(template);
    // console.log(tokens);
    let code: string = this.generateCode(tokens);
    // console.log(code);

    return this.executeCode(code, view);
  }

  private generateCode(tokens: string[]) {
    let code = "var r=[];";

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
    code += 'return r.join("");';
    return code;
  }

  private getTokens(template: string) {
    const tokensRegex =
      /\{\{([^}]+)\}\}|@[^\(]+\(([^\)]+)\)\s*|@endif\s*|@endfor\s*|@else\s*/g;
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

    return line;
  }
}
