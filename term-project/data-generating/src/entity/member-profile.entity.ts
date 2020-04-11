import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'MEMBER_PROFILE' })
export class MemberProfile {
  constructor(
    cardNumber: string,
    accountNum: string,
    occupation: string,
    incomepermonth: string,
  ) {
    this.CardNumber = cardNumber;
    this.AccountNum = accountNum;
    this.Occupation = occupation;
    this.Incomepermonth = incomepermonth;
  }

  @PrimaryColumn()
  CardNumber: string;

  @Column()
  AccountNum: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  Occupation: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  Incomepermonth: string | null;
}
