export class HomeController {
  public async index(): Promise<string> {
    return "hello from controller";
  }
}
