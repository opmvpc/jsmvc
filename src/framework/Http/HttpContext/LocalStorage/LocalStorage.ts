import { AsyncLocalStorage } from "async_hooks";
import { HttpContext } from "../HttpContext";

export const storage = new AsyncLocalStorage<HttpContext>();
