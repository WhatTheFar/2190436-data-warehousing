import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'EMPLOYEE' })
export class Employee {
  constructor(
    employeeNum: string,
    name: string,
    surname: string,
    gender: string,
    storeNum: string,
    workHour: string,
  ) {
    this.EmployeeNumber = employeeNum;
    this.NameEN = name;
    this.SurnameEN = surname;
    this.Gender = gender;
    this.StoreNumber = storeNum;
    this.WorkHour = workHour;
  }

  @PrimaryGeneratedColumn('uuid')
  EmployeeNumber: string;

  @Column({ type: 'nvarchar', length: 50 })
  StoreNumber: string;

  @Column({ type: 'nvarchar', length: 50 })
  NameEN: string;

  @Column({ type: 'nvarchar', length: 50 })
  SurnameEN: string;

  @Column({ type: 'nvarchar', length: 10 })
  Gender: string;

  @Column({ type: 'nvarchar', length: 10 })
  WorkHour: string;
}
