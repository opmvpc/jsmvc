import { HttpContext } from "../Http/HttpContext/HttpContext";
import { response } from "../Http/Response";

export async function view(path: string, data: {} = {}): Promise<any> {
  return response(await HttpContext.get()?.viewManager.resolve(path, data));
}
