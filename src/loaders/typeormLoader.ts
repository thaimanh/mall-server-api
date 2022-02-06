import { createConnection, getConnectionOptions } from "typeorm";

import { env } from "../env";

export const typeormLoader = async () => {
  const loadedConnectionOptions = await getConnectionOptions();

  const connectionOptions = Object.assign(loadedConnectionOptions, {
    type: env.db.type as any,
    host: env.db.host,
    port: env.db.port,
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    synchronize: env.db.synchronize,
    logging: env.db.logging,
    entities: env.app.dirs.entities,
    migrations: env.app.dirs.migrations,
  });

  await createConnection(connectionOptions);
};
