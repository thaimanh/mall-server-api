import * as dotenv from "dotenv";
import * as path from "path";
import { getOsEnv, normalizePort, toBool, toNumber } from "./lib/env";

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
    name: getOsEnv("APP_NAME"),
    host: getOsEnv("APP_HOST"),
    schema: getOsEnv("APP_SCHEMA"),
    routePrefix: getOsEnv("APP_ROUTE_PREFIX"),
    port: normalizePort(process.env.PORT || getOsEnv("APP_PORT")),
    dirs: {
      migrations: getOsEnv("TYPEORM_MIGRATIONS"),
      migrationsDir: getOsEnv("TYPEORM_MIGRATIONS_DIR"),
      entities: getOsEnv("TYPEORM_ENTITIES"),
      entitiesDir: getOsEnv("TYPEORM_ENTITIES_DIR"),
      controllers: getOsEnv("CONTROLLERS"),
      middlewares: getOsEnv("MIDDLEWARES"),
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
