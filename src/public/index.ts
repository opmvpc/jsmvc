import "dotenv/config";
import path from "path";
import { registerRoutes } from "../app/routes/web";
import { Server } from "../framework/Http/Server";

const server = new Server();
registerRoutes(server.router);
server.viewManager.addPath(path.resolve(__dirname, "../../resources/views"));
server.create().listen(process.env.PORT || 8000);
