import { knex } from "@/database/knex";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

class OrdersController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_session_id: z.number(),
        product_id: z.number(),
        quantity: z.number(),
      });

      const { product_id, quantity, table_session_id } = bodySchema.parse(
        request.body
      );

      const session = await knex<TablesSessionsRepository>("tables_sessions")
        .where({ id: table_session_id })
        .first();

      if (!session) {
        throw new AppError("Table session not found", 404);
      }

      if (session.closed_at) {
        throw new AppError("Table session is closed");
      }

      const prodcuts = await knex<ProductTable>("products")
        .where({
          id: product_id,
        })
        .first();

      if (!prodcuts) {
        throw new AppError("Product not found", 404);
      }

      await knex<OrderRespository>("orders").insert({
        table_session_id,
        product_id,
        quantity,
        price: prodcuts.price,
      });

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  }

  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const table_session_id = z
        .string()
        .transform((value) => parseInt(value))
        .refine((value) => !isNaN(value), {
          message: "Id must be a number",
        })
        .parse(request.params.table_session_id);

      const order = await knex<OrderRespository>("orders")
        .select(
          "orders.id",
          "orders.table_session_id",
          "orders.product_id",
          "products.name",
          "orders.price",
          "orders.quantity",
          knex.raw("orders.price * orders.quantity as total"),
          "orders.created_at",
          "orders.updated_at"
        )
        .join("products", "products.id", "orders.product_id")
        .where({
          table_session_id,
        })
        .orderBy("orders.created_at", "desc");

      return response.json(order);
    } catch (error) {
      next(error);
    }
  }

  async show(request: Request, response: Response, next: NextFunction) {
    try {
      const table_session_id = z
        .string()
        .transform((value) => parseInt(value))
        .refine((value) => !isNaN(value), {
          message: "Id must be a number",
        })
        .parse(request.params.table_session_id);

      const order = await knex<OrderRespository>("orders")
        .select(
          knex.raw("COALESCE(SUM(orders.price * orders.quantity), 0) AS total"),
          knex.raw("COALESCE(SUM(orders.quantity), 0) AS quantity")
        )
        .where({ table_session_id })
        .first();

      return response.json(order);
    } catch (error) {
      next(error);
    }
  }
}

export { OrdersController };
