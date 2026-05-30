import { db } from "#/db";
import * as schemas from "#/db/schemas";
import { DrizzleQueryError } from "drizzle-orm";

const nameSymbol = Symbol.for("drizzle:Name");
const tableNames: string[] = [];
const successfulDroppedTableNames: string[] = [];
const failedDroppedTableNames: string[] = [];

for (const key in schemas) {
  const schema = (schemas as Record<string, any>)[key as keyof typeof schemas];

  const tableName = schema[nameSymbol];
  if (!tableName) {
    // not a table, can be a id export, like userIdColumn
    continue;
  }

  tableNames.push(tableName as string);
}

console.log(`Dropping tables: ${tableNames.join(", ")}`);

const getErrorMessage = (error: unknown) => {
  let errorMessage = "";
  if (error instanceof Error) {
    if (error instanceof DrizzleQueryError) {
      errorMessage = error.cause?.message ?? error.message ?? "Unknown error";
    } else {
      errorMessage = error.message;
    }
  } else {
    errorMessage = String(error);
  }

  return errorMessage;
};

const dropTable = async (tableName: string) => {
  try {
    // no DROP TABLE IF EXISTS, we want to fail if the table does not exist and report the error
    await db.run(`DROP TABLE ${tableName}`);
    console.log(`Dropped table: ${tableName}`);
    successfulDroppedTableNames.push(tableName);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`Error dropping table ${tableName}: ${errorMessage}`);
    failedDroppedTableNames.push(tableName);
  }
};

const tableNamesReportMeta = (tableNames: string[]) => {
  const count = tableNames.length;
  let names = "";

  if (count > 0) {
    names = tableNames.join(", ");
  } else {
    names = "none";
  }

  return { count, names };
};

for (const tableName of tableNames) {
  await dropTable(tableName);
}

await dropTable("__drizzle_migrations");

const successfulDroppedTableNamesReport = tableNamesReportMeta(
  successfulDroppedTableNames,
);
const failedDroppedTableNamesReport = tableNamesReportMeta(
  failedDroppedTableNames,
);
console.log(
  `Successful dropped tables (${successfulDroppedTableNamesReport.count}): ${successfulDroppedTableNamesReport.names}`,
);
console.log(
  `Failed dropped tables (${failedDroppedTableNamesReport.count}): ${failedDroppedTableNamesReport.names}`,
);
