import * as dotenv from 'dotenv';
import * as yargs from 'yargs';

import { withConnection } from './db';
import { generateIncomeToDb } from './income';
import {
  generateEmployee,
  linkEmployeeToSalesTransactionSum,
} from './employee';

dotenv.config();

// tslint:disable: no-shadowed-variable
// tslint:disable: no-empty
const argv = yargs
  .command('process [name]', 'Process data generating', yargs => {
    yargs
      .command(
        'income',
        // tslint:disable-next-line: quotemark
        "Generate MemberProfile's income per month",
        yargs => {},
        async argv => {
          await withConnection(async connection => {
            await generateIncomeToDb(connection);
          });
        },
      )
      .command(
        'employee',
        'Generate Employee table',
        yargs => {},
        async argv => {
          await withConnection(async (oldConnection, newConnection) => {
            await generateEmployee(oldConnection, newConnection);
          });
        },
      )
      .command(
        'sale-employee',
        'Link Employee to SalesTransactionSummary',
        yargs => {},
        async argv => {
          await withConnection(async (oldConnection, newConnection) => {
            await linkEmployeeToSalesTransactionSum(
              oldConnection,
              newConnection,
            );
          });
        },
      )
      .demandCommand();
  })
  .demandCommand()
  .version(false)
  .help().argv;
