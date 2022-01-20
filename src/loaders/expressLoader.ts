import { useExpressServer, createExpressServer } from "routing-controllers";
import { env } from "../env";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";

export const expressLoader = () => {
  let app = express();
  useExpressServer(app, {
    cors: true,
    routePrefix: env.app.routePrefix,
    defaultErrorHandler: false,
  });

  // set log request
  app.use(morgan("dev"));

  // set security HTTP headers
  app.use(helmet());

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));
  
  app.listen(env.app.port);
};
