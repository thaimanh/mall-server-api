import "reflect-metadata";
import { env } from "./env";
import { expressLoader } from "./loaders/expressLoader";
import { typeormLoader } from "./loaders/typeormLoader";
import { swaggerLoader } from "./loaders/swaggerLoader";
import { iocLoader } from "./loaders/iocLoader";

async function init() {
  // IOC loader
  iocLoader();

  // TypeORM loader
  typeormLoader();

  // Express loader
  const app = expressLoader();

  // Swagger loader
  swaggerLoader(app);
}

init()
  .then(() => {
    console.log(`Express server is running on ${env.app.port}`);
  })
  .catch((error) => console.log(`Application error: ${error}`));
