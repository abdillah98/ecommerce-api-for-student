import { eq, and } from "drizzle-orm";
import { db } from "../../database/db.js";
import { purchases } from "../../database/schema/purchases.js";
import { purchaseItems } from "../../database/schema/purchase-items.js";
import { carts } from "../../database/schema/carts.js";
import { products } from "../../database/schema/products.js";
import { paymentMethods } from "../../database/schema/payment-methods.js";
import { AppError } from "../../utils/app-error.js";

interface CheckoutDTO {
  address: string;
  paymentMethodId: number;
}

export async function checkout(
  projectId: number,
  userId: number,
  payload: CheckoutDTO
) {
  if (!payload.address) {
    throw new AppError("Address is required", 400);
  }
  if (!payload.paymentMethodId) {
    throw new AppError("Payment Method ID is required", 400);
  }

  return await db.transaction(async (tx) => {
    // 0. Validate payment method exists and belongs to this project
    const pMethod = await tx
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, payload.paymentMethodId),
          eq(paymentMethods.projectId, projectId)
        )
      );

    if (!pMethod[0]) {
      throw new AppError("Payment method not found or does not belong to this project", 400);
    }

    // 1. Get cart items with product details
    const cartItems = await tx
      .select({
        id: carts.id,
        productId: carts.productId,
        quantity: carts.quantity,
        productName: products.productName,
        productPrice: products.productPrice,
        productStock: products.productStock,
      })
      .from(carts)
      .innerJoin(products, eq(carts.productId, products.id))
      .where(
        and(
          eq(carts.projectId, projectId),
          eq(carts.userId, userId)
        )
      );

    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // 2. Validate stock and calculate total price
    let totalPrice = 0;
    for (const item of cartItems) {
      const stock = item.productStock ?? 0;
      const quantity = item.quantity ?? 0;
      if (stock < quantity) {
        throw new AppError(`Insufficient stock for product: ${item.productName}`, 400);
      }
      totalPrice += quantity * (item.productPrice ?? 0);
    }

    // 3. Create purchase
    const purchaseResult = await tx
      .insert(purchases)
      .values({
        projectId,
        userId,
        totalPrice,
        status: "pending",
        address: payload.address,
        paymentMethodId: payload.paymentMethodId,
      })
      .returning();

    const newPurchase = purchaseResult[0];
    if (!newPurchase) {
      throw new AppError("Failed to create purchase", 500);
    }

    // 4. Create purchase items & update stock
    for (const item of cartItems) {
      const quantity = item.quantity ?? 0;
      const price = item.productPrice ?? 0;
      const stock = item.productStock ?? 0;

      await tx.insert(purchaseItems).values({
        purchaseId: newPurchase.id,
        productId: item.productId,
        quantity,
        price,
      });

      await tx
        .update(products)
        .set({
          productStock: stock - quantity,
        })
        .where(eq(products.id, item.productId));
    }

    // 5. Clear cart
    await tx
      .delete(carts)
      .where(
        and(
          eq(carts.projectId, projectId),
          eq(carts.userId, userId)
        )
      );

    return newPurchase;
  });
}

export async function getPurchases(projectId: number, userId: number) {
  return await db
    .select({
      id: purchases.id,
      projectId: purchases.projectId,
      userId: purchases.userId,
      totalPrice: purchases.totalPrice,
      status: purchases.status,
      address: purchases.address,
      paymentMethodId: purchases.paymentMethodId,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.projectId, projectId),
        eq(purchases.userId, userId)
      )
    );
}

export async function getPurchaseById(projectId: number, userId: number, id: number) {
  const purchaseResult = await db
    .select({
      id: purchases.id,
      projectId: purchases.projectId,
      userId: purchases.userId,
      totalPrice: purchases.totalPrice,
      status: purchases.status,
      address: purchases.address,
      paymentMethodId: purchases.paymentMethodId,
      createdAt: purchases.createdAt,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name,
        type: paymentMethods.type,
        logoUrl: paymentMethods.logoUrl,
      }
    })
    .from(purchases)
    .leftJoin(paymentMethods, eq(purchases.paymentMethodId, paymentMethods.id))
    .where(
      and(
        eq(purchases.id, id),
        eq(purchases.projectId, projectId),
        eq(purchases.userId, userId)
      )
    );

  const purchase = purchaseResult[0];
  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }

  const items = await db
    .select({
      id: purchaseItems.id,
      purchaseId: purchaseItems.purchaseId,
      productId: purchaseItems.productId,
      quantity: purchaseItems.quantity,
      price: purchaseItems.price,
      product: {
        productName: products.productName,
        productImage: products.productImage,
        productDescription: products.productDescription,
      },
    })
    .from(purchaseItems)
    .innerJoin(products, eq(purchaseItems.productId, products.id))
    .where(eq(purchaseItems.purchaseId, id));

  return {
    ...purchase,
    items,
  };
}

export async function updatePurchaseStatus(
  projectId: number,
  userId: number,
  id: number,
  status: string
) {
  const existing = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.id, id),
        eq(purchases.projectId, projectId),
        eq(purchases.userId, userId)
      )
    );

  if (!existing[0]) {
    throw new AppError("Purchase not found", 404);
  }

  const result = await db
    .update(purchases)
    .set({ status })
    .where(eq(purchases.id, id))
    .returning();

  return result[0];
}
