import { HttpContext } from "./HttpContext/HttpContext";

export const response = async (
  body: any,
  status: number = 200,
  header: object = { "Content-Type": "text/html" }
) => {
  const response = HttpContext.get()?.response;
  response.writeHead(status, header);
  response.write(body);
  response.end();
};

export const jsonResponse = (
  body: any,
  status: number = 200,
  header: object = { "Content-Type": "application/json" }
) => {
  const response = HttpContext.get()?.response;
  response.writeHead(status, header);
  response.write(JSON.stringify(body));
  response.end();
};
