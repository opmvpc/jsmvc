import "dotenv/config";
import { Server } from "../framework/Http/Server";

const server = new Server();
server.start();
server.viewManager.addPath(__dirname + "/../../resources/views");
