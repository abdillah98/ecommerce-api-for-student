import { eq, and } from "drizzle-orm";
import { db } from "../../database/db.js";
import { products } from "../../database/schema/products.js";
import { AppError } from "../../utils/app-error.js";

interface CreateProductDTO {
  categoryId?: number;
  productName: string;
  productDescription?: string;
  productPrice: number;
  productStock?: number;
  productImage?: string;
}

export async function createProduct(
  projectId: number,
  payload: CreateProductDTO
) {
  const [result] = await db
    .insert(products)
    .values({
      projectId,
      categoryId: payload.categoryId || null,
      productName: payload.productName,
      productDescription: payload.productDescription || null,
      productPrice: payload.productPrice,
      productStock: payload.productStock ?? 0,
      productImage: payload.productImage || null,
    });

  return await getProductById(projectId, result.insertId);
}

export async function getProducts(projectId: number, categoryId?: number) {
  if (categoryId) {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.projectId, projectId),
          eq(products.categoryId, categoryId)
        )
      );
  }
  return await db
    .select()
    .from(products)
    .where(eq(products.projectId, projectId));
}

export async function getProductById(projectId: number, id: number) {
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, id),
        eq(products.projectId, projectId)
      )
    );

  return result[0];
}

export async function updateProduct(
  projectId: number,
  id: number,
  payload: CreateProductDTO
) {
  const existing = await getProductById(projectId, id);

  if (!existing) {
    throw new AppError("Product not found", 404);
  }

  await db
    .update(products)
    .set({
      categoryId: payload.categoryId !== undefined ? payload.categoryId : existing.categoryId,
      productName: payload.productName !== undefined ? payload.productName : existing.productName,
      productDescription: payload.productDescription !== undefined ? payload.productDescription : existing.productDescription,
      productPrice: payload.productPrice !== undefined ? payload.productPrice : existing.productPrice,
      productStock: payload.productStock !== undefined ? payload.productStock : existing.productStock,
      productImage: payload.productImage !== undefined ? payload.productImage : existing.productImage,
    })
    .where(
      and(
        eq(products.id, id),
        eq(products.projectId, projectId)
      )
    );

  return await getProductById(projectId, id);
}

export async function deleteProduct(projectId: number, id: number) {
  const existing = await getProductById(projectId, id);

  if (!existing) {
    throw new AppError("Product not found", 404);
  }

  await db
    .delete(products)
    .where(
      and(
        eq(products.id, id),
        eq(products.projectId, projectId)
      )
    );

  return existing;
}
