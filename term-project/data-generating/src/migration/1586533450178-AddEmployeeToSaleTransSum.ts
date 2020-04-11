import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddEmployeeToSaleTransSum1586532301332
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumn(
      'SALES_TRANSACTION_SUMMARY',
      new TableColumn({
        name: 'EmployeeNumber',
        type: 'uniqueidentifier',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'SALES_TRANSACTION_SUMMARY',
      new TableForeignKey({
        name: 'FK_SALES_TRANSACTION_SUMMARY_EMPLOYEE',
        columnNames: ['EmployeeNumber'],
        referencedTableName: 'EMPLOYEE',
        referencedColumnNames: ['EmployeeNumber'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const table = await queryRunner.getTable('SALES_TRANSACTION_SUMMARY');
    const foreignKey = table!.foreignKeys.find(
      fk => fk.name === 'FK_SALES_TRANSACTION_SUMMARY_EMPLOYEE',
    );
    await queryRunner.dropForeignKey('SALES_TRANSACTION_SUMMARY', foreignKey!);
    await queryRunner.dropColumn('SALES_TRANSACTION_SUMMARY', 'EmployeeNumber');
  }
}
