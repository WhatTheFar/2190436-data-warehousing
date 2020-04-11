import { createConnections, Connection } from 'typeorm';

export async function initConnection(): Promise<[Connection, Connection]> {
  const connections = await createConnections([
    {
      name: 'old',
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      entities: [
        'src/entity/member-profile.entity.ts',
        'src/entity/sale-transaction-sum.entity.ts',
      ],
    },
    {
      name: 'new',
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: ['src/entity/employee.entity.ts'],
    },
  ]);

  return [connections[0], connections[1]];
}

export async function withConnection(
  fn: (oldConnection: Connection, newConnection: Connection) => Promise<void>,
) {
  const [oldConnection, newConnection] = await initConnection();
  try {
    await fn(oldConnection, newConnection);
  } catch (error) {
    throw error;
  }
  await oldConnection.close();
  await newConnection.close();
}
