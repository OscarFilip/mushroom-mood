import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { isVerboseLoggingEnabled, logDebug, logInfo } from "@/lib/utils/observability";

const SQL_KEYWORD_PATTERN = /\b(select|from|left join|right join|inner join|outer join|full join|cross join|join|where|group by|order by|having|limit|offset|insert into|values|update|set|delete from|returning|on|and|or|as|in|is null|is not null|not null)\b/gi;
const SQL_CLAUSE_BREAK_PATTERN = /\s+(SELECT|FROM|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|JOIN|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|RETURNING)\b/g;
const POSTGRES_INTROSPECTION_QUERY_PATTERN = /from\s+pg_catalog\.pg_type/i;

const globalForDb = global as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
  dbBootstrapLogged?: boolean;
};
const sqlDebugEnabled = isVerboseLoggingEnabled();
const isProductionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!isProductionBuildPhase && !globalForDb.dbBootstrapLogged) {
  globalForDb.dbBootstrapLogged = true;

  logInfo("[db] bootstrap", {
    sqlDebugEnabled,
    nodeEnv: process.env.NODE_ENV,
  });
}

const sql = postgres(process.env.DATABASE_URL || "", {
  debug: sqlDebugEnabled
    ? (connection, query, parameters, paramTypes) => {
        if (shouldSkipSqlLog(query)) {
          return;
        }

        logDebug("[db] sql query", {
          connection,
          query: formatSqlForLog(query),
          parameters,
          paramTypes,
        });
      }
    : false,
});

export const db =
  globalForDb.db ??
  drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

function formatSqlForLog(query: string): string {
  return query
    .replace(/\s+/g, " ")
    .trim()
    .replace(SQL_KEYWORD_PATTERN, (keyword) => keyword.toUpperCase())
    .replace(SQL_CLAUSE_BREAK_PATTERN, "\n$1");
}

function shouldSkipSqlLog(query: string): boolean {
  return POSTGRES_INTROSPECTION_QUERY_PATTERN.test(query);
}
