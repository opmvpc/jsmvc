import { HttpContext } from "../Http/HttpContext/HttpContext";
import { response } from "../Http/Response";

export function view(path: string, data: {} = {}): any {
  return response(HttpContext.get()?.viewManager.resolve(path, data));
}
