import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("orders", (table) => {
    table.increments("id").primary(),
      table
        .integer("table_session_id")
        .references("id")
        .inTable("tables_sessions")
        .notNullable(),
      table
        .integer("product_id")
        .notNullable()
        .references("id")
        .inTable("products"),
      table.integer("quantity").notNullable(),
      table.decimal("price").notNullable(),
      table.timestamp("created_at").defaultTo(knex.fn.now()),
      table.timestamp("updated_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("orders");
}
