import { view } from "../../../framework/View/ViewHelper";

export class HomeController {
  public async index(): Promise<string> {
    return await view("mixed", {
      users: [
        { name: "Jean Bauche", role: "admin" },
        { name: "Eli Kopter", role: "guest" },
      ],
    });
  }
}
