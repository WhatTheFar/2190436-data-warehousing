import { Connection } from 'typeorm';
import * as faker from 'faker';

import { SalesTransactionSummary } from './entity/sale-transaction-sum.entity';
import { createSingleProgressBar } from './utils';
import { Employee } from './entity/employee.entity';

const WORK_HOURS = ['00-08', '08-16', '16-24'];
const GENDERS = ['male', 'female'];

export function createStoreEmployee(
  storeNum: string,
): Array<Omit<Employee, 'EmployeeNumber'>> {
  return WORK_HOURS.map<Omit<Employee, 'EmployeeNumber'>>(workHour => {
    const gender = faker.random.arrayElement(GENDERS);
    // const gender = GENDERS[genderIndex];
    return {
      StoreNumber: storeNum,
      NameEN: faker.name.firstName(gender as any),
      SurnameEN: faker.name.lastName(gender as any),
      Gender: gender,
      WorkHour: workHour,
    };
  });
}

export async function generateEmployee(
  oldConnection: Connection,
  newConnection: Connection,
) {
  faker.seed(42);

  const salesTransactionSumRepo = oldConnection.getRepository(
    SalesTransactionSummary,
  );
  const employeeRepo = newConnection.getRepository(Employee);

  await employeeRepo.clear();

  // console.log(
  //   salesTransactionSumRepo
  //     .createQueryBuilder('sale')
  //     .select('DISTINCT sale.StoreNumber', 'sale_StoreNumber')
  //     .getSql(),
  // );

  const storeNumbers = await salesTransactionSumRepo
    .createQueryBuilder('sale')
    .select('DISTINCT sale.StoreNumber', 'StoreNumber')
    .getRawMany<{ StoreNumber: string }>();

  const progressBar = createSingleProgressBar();
  progressBar.start(storeNumbers.length, 0);

  for (const { StoreNumber: storeNumber } of storeNumbers) {
    if (storeNumber === '') {
      await progressBar.increment();
      continue;
    }
    const employees = createStoreEmployee(storeNumber);
    const result = await employeeRepo.insert(employees);

    await progressBar.increment();
  }
  await progressBar.stop();
}

async function updateSalesTransSumEmployeeNum(
  connection: Connection,
  receiptIdList: string[],
  employeeNumber: string,
) {
  const result = connection
    .createQueryBuilder()
    .update(SalesTransactionSummary)
    .set({ EmployeeNumber: employeeNumber })
    .where('ReceiptID IN (:...ids)', { ids: receiptIdList })
    .execute();
}

export async function linkEmployeeToSalesTransactionSum(
  oldConnection: Connection,
  newConnection: Connection,
) {
  const salesTransactionSumRepo = oldConnection.getRepository(
    SalesTransactionSummary,
  );
  const employeeRepo = newConnection.getRepository(Employee);
  const sales = await salesTransactionSumRepo
    .createQueryBuilder('sale')
    // tslint:disable-next-line: quotemark
    .where("sale.StoreNumber != ''")
    .getMany();

  const progressBar = createSingleProgressBar();
  progressBar.start(sales.length, 0);

  const employeeStoreNumsMap: { [employeeNum: string]: string[] } = {};

  for (const sale of sales) {
    if (sale.EmployeeNumber == null) {
      await progressBar.increment();
      continue;
    }
    const hour = sale.TransDate.getHours();
    let workHour = '';
    if (hour < 8) {
      workHour = WORK_HOURS[0];
    } else if (hour < 16) {
      workHour = WORK_HOURS[1];
    } else {
      workHour = WORK_HOURS[2];
    }
    const employee = await employeeRepo.findOneOrFail({
      StoreNumber: sale.StoreNumber,
      WorkHour: workHour,
    });
    const receiptIdList = employeeStoreNumsMap[employee.EmployeeNumber] || [];
    receiptIdList.push(sale.ReceiptID);

    if (receiptIdList.length >= 2000) {
      await updateSalesTransSumEmployeeNum(
        oldConnection,
        receiptIdList,
        employee.EmployeeNumber,
      );
      employeeStoreNumsMap[employee.EmployeeNumber] = [];

      await progressBar.increment(receiptIdList.length);

      continue;
    }
    employeeStoreNumsMap[employee.EmployeeNumber] = receiptIdList;
  }
  for (const key in employeeStoreNumsMap) {
    if (employeeStoreNumsMap.hasOwnProperty(key)) {
      const employeeNumber = key;
      const receiptIdList = employeeStoreNumsMap[key];

      await updateSalesTransSumEmployeeNum(
        oldConnection,
        receiptIdList,
        employeeNumber,
      );

      await progressBar.increment(receiptIdList.length);
    }
  }

  await progressBar.stop();
}
