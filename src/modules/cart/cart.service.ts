import { eq, and } from "drizzle-orm";
import { db } from "../../database/db.js";
import { carts } from "../../database/schema/carts.js";
import { products } from "../../database/schema/products.js";
import { AppError } from "../../utils/app-error.js";

interface AddToCartDTO {
  productId: number;
  quantity?: number;
}

export async function addToCart(
  projectId: number,
  userId: number,
  payload: AddToCartDTO
) {
  // Check if product exists first
  const productExists = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, payload.productId),
        eq(products.projectId, projectId)
      )
    );

  if (!productExists[0]) {
    throw new AppError("Product not found or not in this project", 404);
  }

  // Check if item already in cart
  const existing = await db
    .select()
    .from(carts)
    .where(
      and(
        eq(carts.projectId, projectId),
        eq(carts.userId, userId),
        eq(carts.productId, payload.productId)
      )
    );

  const quantityToAdd = payload.quantity ?? 1;

  if (existing[0]) {
    await db
      .update(carts)
      .set({
        quantity: (existing[0].quantity ?? 0) + quantityToAdd,
      })
      .where(eq(carts.id, existing[0].id));
      
    const updated = await db
      .select()
      .from(carts)
      .where(eq(carts.id, existing[0].id));
    return updated[0];
  }

  const [result] = await db
    .insert(carts)
    .values({
      projectId,
      userId,
      productId: payload.productId,
      quantity: quantityToAdd,
    });

  const inserted = await db
    .select()
    .from(carts)
    .where(eq(carts.id, result.insertId));

  return inserted[0];
}

export async function getCart(projectId: number, userId: number) {
  return await db
    .select({
      id: carts.id,
      projectId: carts.projectId,
      userId: carts.userId,
      productId: carts.productId,
      quantity: carts.quantity,
      createdAt: carts.createdAt,
      product: {
        id: products.id,
        productName: products.productName,
        productPrice: products.productPrice,
        productStock: products.productStock,
        productImage: products.productImage,
        productDescription: products.productDescription,
      },
    })
    .from(carts)
    .innerJoin(products, eq(carts.productId, products.id))
    .where(
      and(
        eq(carts.projectId, projectId),
        eq(carts.userId, userId)
      )
    );
}

export async function updateCartItem(
  projectId: number,
  userId: number,
  id: number,
  quantity: number
) {
  const existing = await db
    .select()
    .from(carts)
    .where(
      and(
        eq(carts.id, id),
        eq(carts.projectId, projectId),
        eq(carts.userId, userId)
      )
    );

  if (!existing[0]) {
    throw new AppError("Cart item not found", 404);
  }

  await db
    .update(carts)
    .set({ quantity })
    .where(eq(carts.id, id));

  const result = await db
    .select()
    .from(carts)
    .where(eq(carts.id, id));

  return result[0];
}

export async function deleteCartItem(
  projectId: number,
  userId: number,
  id: number
) {
  const existing = await db
    .select()
    .from(carts)
    .where(
      and(
        eq(carts.id, id),
        eq(carts.projectId, projectId),
        eq(carts.userId, userId)
      )
    );

  if (!existing[0]) {
    throw new AppError("Cart item not found", 404);
  }

  await db
    .delete(carts)
    .where(eq(carts.id, id));

  return existing[0];
}

export async function clearCart(projectId: number, userId: number) {
  await db
    .delete(carts)
    .where(
      and(
        eq(carts.projectId, projectId),
        eq(carts.userId, userId)
      )
    );
}
