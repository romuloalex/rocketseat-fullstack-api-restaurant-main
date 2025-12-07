import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("products", (table) => {
    table.increments("id").primary(),
      table.text("name").nullable(),
      table.decimal("price").nullable(),
      table.timestamp("created_at").defaultTo(knex.fn.now()),
      table.timestamp("updated_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("products");
}
