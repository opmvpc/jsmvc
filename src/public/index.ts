import "dotenv/config";
import { registerRoutes } from "../app/routes/web";
import { Server } from "../framework/Http/Server";

const server = new Server();
registerRoutes(server.router);
server.viewManager.addPath(__dirname + "/../../resources/views");
server.create().listen(process.env.PORT || 8000);
