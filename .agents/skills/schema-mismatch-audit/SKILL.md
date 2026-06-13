---
name: schema-mismatch-audit
description: Procedure for aligning database schema mismatches where client code attempts to push fields missing in Appwrite config and production.
disable-model-invocation: false
---

# Schema Mismatch Audit & Resolution Guide

Use this skill when coupon creation, project creation, or other resource CRUD operations fail due to "unknown attribute" or "invalid document structure" errors. This typically indicates a mismatch between fields defined in client-side/server-side actions and attributes configured in Appwrite.

## Core Mandates

1. **Client Code is the Truth**: If the application code is attempting to save, query, or check a field that is missing from the database, treat the code's field usage as the correct definition.
2. **Never Edit Schema Configuration Manually**: Do not hand-edit `appwrite.config.json`.
3. **Never Run Bulk Migration Scripts**: Do not run bulk database migrations or recreation scripts on production environments.
4. **Deploy Surgically via Appwrite CLI**: Add missing attributes individually to the live production database using the Appwrite CLI, then pull/sync the schema back to update `appwrite.config.json`.

## Resolution Procedure

### Step 1: Discover Missing Fields
Review the error messages or the payload passed to `databases.createRow`, `databases.updateRow`, or server actions. Check the fields in `appwrite.config.json` for the target table. Identify any missing keys.

### Step 2: Determine Attribute Types & Constraints
Based on how the field is consumed in code:
- Numeric fields (e.g. `discountPercent`, `redemptionLimit`) $\rightarrow$ Integer or Float attributes.
- String fields/JSON metadata $\rightarrow$ String attributes (with appropriate size, e.g. 256 for IDs, 65535 for serialized objects).
- Temporal flags $\rightarrow$ DateTime or Boolean attributes.

### Step 3: Create attributes on Live Database
Run individual `appwrite databases create-*-attribute` commands.

*Example (Integer Attribute):*
```bash
appwrite databases create-integer-attribute \
  --database-id <db-id> \
  --collection-id <table-id> \
  --key <field-key> \
  --required false \
  --min <min> \
  --max <max> \
  --xdefault <default-value>
```

*Example (String Attribute):*
```bash
appwrite databases create-string-attribute \
  --database-id <db-id> \
  --collection-id <table-id> \
  --key <field-key> \
  --size 256 \
  --required false
```

### Step 4: Pull Schema updates
Once the attribute status becomes `available` in the live database, pull the updated schema back to the local config:
```bash
appwrite pull tables
```

Verify that the local `appwrite.config.json` now includes the newly added columns.
