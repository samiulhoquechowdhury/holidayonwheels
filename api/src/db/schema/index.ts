/**
 * Every table, in one namespace.
 *
 * drizzle-kit reads this file to diff the schema against the database, so a
 * table that is not exported from here does not exist as far as migrations
 * are concerned — a silent omission rather than an error. Adding a schema
 * file means adding its re-export here.
 */
export * from "./enums";
export * from "./auth";
export * from "./content";
export * from "./commerce";
export * from "./planner";
export * from "./system";
