const { defaultMetadataStorage } = require("class-transformer/cjs/storage");
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUi from "swagger-ui-express";
import { UserController } from "../api/controllers/user/user.controller";
import express from "express";

import { env } from "../env";
import { authorizationChecker } from "../api/auth/authorizationChecker";

export const swaggerLoader = (expressApp: express.Express) => {
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: "#/components/schemas/",
  });

  const storage = getMetadataArgsStorage();
  const swaggerFile = routingControllersToSpec(
    storage,
    { authorizationChecker },
    {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      },
    }
  );

  // Add npm infos to the swagger doc
  swaggerFile.info = {
    title: env.app.name,
    description: "OpenAPI Documentation for `mall-server-api`",
    version: "1.0.0",
  };

  swaggerFile.servers = [
    {
      url: `${env.app.schema}://${env.app.host}:${env.app.port}${env.app.routePrefix}`,
    },
  ];

  expressApp.use(
    env.swagger.route,
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile)
  );
};
