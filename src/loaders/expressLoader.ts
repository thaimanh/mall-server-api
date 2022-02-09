import { useExpressServer } from "routing-controllers";
import logger from "jet-logger";
import { env } from "../env";
import morgan from "morgan";
import { HttpError } from "routing-controllers";
import { ValidationError } from "class-validator";
import express from "express";
import { UserController } from "../api/controllers/user.controller";
import { authorizationChecker } from "../api/auth/authorizationChecker";
import StatusCodes from "http-status";

export const expressLoader = () => {
  let app = express();
  useExpressServer(app, {
    cors: true,
    classTransformer: true,
    routePrefix: env.app.routePrefix,
    defaultErrorHandler: false,
    controllers: [UserController],
    authorizationChecker,
  });

  const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;

  // set log request
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

  // set security HTTP headers
  // app.use(helmet());

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  // log error
  app.use(
    (
      err: Error | ValidationError | HttpError,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      logger.err(err, true);
      if (err instanceof ValidationError) {
        return res.status(BAD_REQUEST).json({
          error: err.toString(),
          details: err.property,
        });
      }
      if (err instanceof HttpError) {
        return res.status(err.httpCode || INTERNAL_SERVER_ERROR).json({
          error: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: err.message,
      });
    }
  );

  app.listen(env.app.port);

  return app;
};
