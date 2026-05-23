import app from "./app";
import config from "./config";
import { initDB } from "./db";

const main = () => {
  // Connect Database
  initDB();

  // Server listener
  app.listen(config.port, () => {
    console.log(`This Server is listening on port ${config.port}`);
  });
};

main();
