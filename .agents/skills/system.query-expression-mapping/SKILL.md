---
name: system.query-expression-mapping
description: Deep dive into the database query mapper in Kylrix. Explains how clean QueryExpressions (e.g. equal, contains, limit) are mapped to database-specific formats to keep code agnostic.
---

# Why: Agnostic Query Expression Mapping & Translation

In a Hexagonal Backend Architecture, core business logic must not write queries using platform-specific SDK functions. If a service imports `Query.equal` or `Query.limit` from `node-appwrite`, it binds the service directly to Appwrite, making it very difficult to switch to SQL or another database in the future.

We solve this using **Agnostic Query Expression Mapping** in `lib/core/adapters/appwrite/database.adapter.ts`.

## 1. Agnostic Query Interface

Instead of raw database query strings, our ports expect a clean list of `QueryExpression` objects:

```typescript
export interface QueryExpression {
  type: 'equal' | 'notEqual' | 'lessThan' | 'lessThanEqual' | 'greaterThan' | 'greaterThanEqual' | 'search' | 'orderAsc' | 'orderDesc' | 'limit' | 'offset' | 'select' | 'contains';
  attribute?: string;
  value?: any;
}
```

This simple dictionary format can be constructed anywhere—on the client, server, or in CLI tools—without importing database SDKs.

## 2. Adapter-Specific Mapping Engine

Inside each database adapter, we translate these abstract expressions into the database's native query syntax. For the Appwrite Adapter, this is done by `mapQueryExpressions`:

```typescript
export function mapQueryExpressions(expressions: QueryExpression[]): string[] {
  return expressions.map((exp) => {
    switch (exp.type) {
      case 'equal':
        return Query.equal(exp.attribute!, exp.value);
      case 'notEqual':
        return Query.notEqual(exp.attribute!, exp.value);
      case 'lessThan':
        return Query.lessThan(exp.attribute!, exp.value);
      case 'orderAsc':
        return Query.orderAsc(exp.attribute!);
      case 'limit':
        return Query.limit(exp.value);
      case 'contains':
        return Query.contains(exp.attribute!, exp.value);
      default:
        throw new Error(`Unsupported query type: ${exp.type}`);
    }
  });
}
```

## 3. High Flexibility

This adapter translation pattern gives us absolute flexibility:
- If we switch to a SQL-based adapter (e.g., PostgreSQL or SQLite), we write a mapper that translates `QueryExpression[]` into a clean SQL query: `SELECT * FROM table WHERE attribute = value LIMIT x`.
- We can pass pre-mapped query strings directly into the adapter if a database-specific escape hatch is needed, maintaining a balance between clean architecture and performance.
