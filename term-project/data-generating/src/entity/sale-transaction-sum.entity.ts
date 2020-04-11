import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'SALES_TRANSACTION_SUMMARY' })
export class SalesTransactionSummary {
  constructor(
    transDate: Date,
    storeNum: string,
    receiptId: string,
    employeeNumber: string,
  ) {
    this.TransDate = transDate;
    this.ReceiptID = receiptId;
    this.StoreNumber = storeNum;
    this.EmployeeNumber = employeeNumber;
  }

  @PrimaryColumn({ type: 'datetime' })
  TransDate: Date;

  @PrimaryColumn({ type: 'nvarchar', length: 50 })
  ReceiptID: string;

  @PrimaryColumn({ type: 'nvarchar', length: 10 })
  StoreNumber: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  EmployeeNumber: string | string;
}
