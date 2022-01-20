import "reflect-metadata";
import { env } from "./env";
import { expressLoader } from "./loaders/expressLoader";

async function initApp() {
  // Express
  const app = expressLoader();
}

initApp()
  .then(() => {
    console.log(`Express server is running on ${env.app.port}`);
  })
  .catch((error) => console.log(`Application error: ${error}`));
