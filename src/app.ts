import "reflect-metadata";
import { env } from "./env";
import { expressLoader } from "./loaders/expressLoader";
import { iocLoader } from "./loaders/iocLoader";
import { swaggerLoader } from "./loaders/swaggerLoader";
import { typeormLoader } from "./loaders/typeormLoader";

async function init() {
  // IOC loader
  iocLoader();

  // TypeORM loader
  typeormLoader();

  // Express loader
  const app = expressLoader();

  // Swagger loaders
  swaggerLoader(app);
}

init()
  .then(() => {
    console.log(`Express server is running on ${env.app.port}`);
  })
  .catch((error) => console.log(`Application error: ${error}`));
