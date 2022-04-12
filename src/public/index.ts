import "dotenv/config";
import path from "path";
import { registerRoutes } from "../app/routes/web";
import { Server } from "../framework/Http/Server";

const server = new Server();
registerRoutes(server.router);
server.viewManager.addPath(path.resolve(__dirname, "../../resources/views"));
const serverInstance = server.create();
serverInstance.listen(process.env.PORT || 8000);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception at:" + err);
  serverInstance.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 1000).unref();
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);

  serverInstance.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 1000).unref();
});
