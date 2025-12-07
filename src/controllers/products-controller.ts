import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { knex } from "@/database/knex";
import { AppError } from "@/utils/AppError";

class ProductController {
  async index(request: Request, response: Response, next: NextFunction) {
    const { name } = request.query;
    try {
      const products = await knex<ProductTable>("products")
        .select()
        .whereLike("name", `%${name ?? ""}%`)
        .orderBy("name");

      return response.json({ products });
    } catch (error) {
      next(error);
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z.string().trim().min(1),
        price: z.number().gt(0),
      });

      const { name, price } = bodySchema.parse(request.body);
      await knex<ProductTable>("products").insert({ name, price });

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "Id must be a number" })
        .parse(request.params.id);

      const bodySchema = z.object({
        name: z.string().trim().min(1),
        price: z.number().gt(0),
      });

      const { name, price } = bodySchema.parse(request.body);
      await knex<ProductTable>("products")
        .update({ name, price, updated_at: knex.fn.now() })
        .where({ id });

      const products = await knex<ProductTable>("products")
        .select()
        .where({ id })
        .first();

      if (!products) {
        throw new AppError("Product not found", 404);
      }

      return response.json();
    } catch (error) {
      next(error);
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "Id must be a number" })
        .parse(request.params.id);

      const products = await knex<ProductTable>("products")
        .select()
        .where({ id })
        .first();

      if (!products) {
        throw new AppError("Product not found", 404);
      }

      await knex<ProductTable>("products").delete().where({ id });

      return response.json();
    } catch (error) {
      next(error);
    }
  }
}

export { ProductController };
