import { Connection } from 'typeorm';

import { MemberProfile } from './entity/member-profile.entity';
import { createSingleProgressBar } from './utils';

const AVG_INCOME = '21400';

const INCOME_RULES: Array<[RegExp, string]> = [
  [/SVP/gim, '250000'],
  [/(VP|Vice President)/gim, '210000'],
  [/politician/gim, '210000'],
  [/chief.*officer/gim, '190000'],
  [/executive/gim, '190000'],
  [/doctor/gim, '170000'],
  [/director/gim, '160000'],
  [/senior.*engineer/gim, '150000'],
  [/engineer/gim, '90000'],
  [/manager/gim, '80000'],
  [/senior/gim, '70000'],
  [/analyst/gim, '60000'],
  [/auditor/gim, '55000'],
  [/specialist/gim, '50000'],
  [/technician/gim, '50000'],
  [/assistant/gim, '45000'],
  [/layer/gim, '45000'],
  [/sale/gim, '40000'],
  [/support/gim, '40000'],
  [/associate/gim, '40000'],
  [/administrator/gim, '35000'],
  [/designer/gim, '33000'],
  [/market(e+r|ing)/gim, '25000'],
  [/nurse/gim, '25000'],
  [/trainer/gim, '19000'],
  [/farmer/gim, '18000'],
  [/officer/gim, '16000'],
  [/cashier/gim, '15000'],
  [/driver/gim, '12000'],
  [/labor/gim, '9000'],
  [/garbage.*collector/gim, '5000'],
];

function getIncomeFromOccupation(occupation: string | null) {
  if (occupation != null) {
    for (const [regex, income] of INCOME_RULES) {
      if (regex.test(occupation) === true) {
        return income;
      }
    }
  }
  return AVG_INCOME;
}

async function updateProfilesIncome(
  connection: Connection,
  accountNumList: string[],
  income: string,
) {
  const results = await connection
    .createQueryBuilder()
    .update(MemberProfile)
    .set({ Incomepermonth: income })
    .where('AccountNum IN (:...ids)', { ids: accountNumList })
    .execute();
}

export async function generateIncomeToDb(connection: Connection) {
  const memberProfileRepo = connection.getRepository(MemberProfile);

  const BATCH_NUM = 50000;
  const profileCount = await connection
    .createQueryBuilder()
    .select('profile')
    .from(MemberProfile, 'profile')
    .getCount();
  const iteration = Math.ceil(profileCount / BATCH_NUM);

  const progressBar = createSingleProgressBar();
  progressBar.start(profileCount, 0);

  const incomeAccountNumsMap: { [income: string]: string[] } = {};

  for (let i = 0; i < iteration; i++) {
    const profiles = await connection
      .createQueryBuilder()
      .select('profile')
      .from(MemberProfile, 'profile')
      // .orderBy('profile.AccountNum')
      .skip(i * BATCH_NUM)
      .take(BATCH_NUM)
      .getMany();

    for (const profile of profiles) {
      const accountNum = profile.AccountNum;
      const occupation = profile.Occupation;
      if (profile.Incomepermonth != null) {
        await progressBar.increment();
        continue;
      }
      const income = getIncomeFromOccupation(occupation);

      const accountNumList = incomeAccountNumsMap[income] || [];
      accountNumList.push(accountNum);

      if (accountNumList.length >= 2000) {
        const results = await connection
          .createQueryBuilder()
          .update(MemberProfile)
          .set({ Incomepermonth: income })
          .where('AccountNum IN (:...ids)', { ids: accountNumList })
          .execute();
        incomeAccountNumsMap[income] = [];

        await progressBar.increment(accountNumList.length);

        continue;
      }

      incomeAccountNumsMap[income] = accountNumList;
    }
  }
  for (const key in incomeAccountNumsMap) {
    if (incomeAccountNumsMap.hasOwnProperty(key)) {
      const income = key;
      const accountNumList = incomeAccountNumsMap[key];
      const results = await connection
        .createQueryBuilder()
        .update(MemberProfile)
        .set({ Incomepermonth: income })
        .where('AccountNum IN (:...ids)', { ids: accountNumList })
        .execute();

      await progressBar.increment(accountNumList.length);
    }
  }

  await progressBar.stop();
}
