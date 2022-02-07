import * as dotenv from "dotenv";
import * as path from "path";
import {
  getOsEnv,
  getOsPath,
  getOsPaths,
  normalizePort,
  toBool,
} from "./lib/env";

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
  path: path.join(
    process.cwd(),
    `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`
  ),
});

/**
 * Environment variables
 */
export const env = {
  node: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development",
  app: {
    secretJwt: getOsEnv("SECRET_JWT"),
    name: getOsEnv("APP_NAME"),
    host: getOsEnv("APP_HOST"),
    schema: getOsEnv("APP_SCHEMA"),
    routePrefix: getOsEnv("APP_ROUTE_PREFIX"),
    port: normalizePort(process.env.PORT || getOsEnv("APP_PORT")),
    dirs: {
      migrations: getOsPaths("TYPEORM_MIGRATIONS"),
      migrationsDir: getOsPath("TYPEORM_MIGRATIONS_DIR"),
      entities: getOsPaths("TYPEORM_ENTITIES"),
      entitiesDir: getOsPath("TYPEORM_ENTITIES_DIR"),
      controllers: getOsPaths("CONTROLLERS"),
      middlewares: getOsPaths("MIDDLEWARES"),
      interceptors: getOsPaths("INTERCEPTORS"),
      subscribers: getOsPaths("SUBSCRIBERS"),
      resolvers: getOsPaths("RESOLVERS"),
    },
  },
  db: {
    type: getOsEnv("TYPEORM_CONNECTION"),
    host: getOsEnv("TYPEORM_HOST"),
    port: getOsEnv("TYPEORM_PORT"),
    username: getOsEnv("TYPEORM_USERNAME"),
    password: getOsEnv("TYPEORM_PASSWORD"),
    database: getOsEnv("TYPEORM_DATABASE"),
    synchronize: toBool(getOsEnv("TYPEORM_SYNCHRONIZE")),
    logging: getOsEnv("TYPEORM_LOGGING"),
  },
  swagger: {
    enabled: toBool(getOsEnv("SWAGGER_ENABLED")),
    route: getOsEnv("SWAGGER_ROUTE"),
    username: getOsEnv("SWAGGER_USERNAME"),
    password: getOsEnv("SWAGGER_PASSWORD"),
  },
};
