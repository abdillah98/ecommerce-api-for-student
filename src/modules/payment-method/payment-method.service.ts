import { eq, and } from "drizzle-orm";
import { db } from "../../database/db.js";
import { paymentMethods } from "../../database/schema/payment-methods.js";
import { AppError } from "../../utils/app-error.js";

interface CreatePaymentMethodDTO {
  name: string;
  type: string; // wallet, bank
  logoUrl?: string;
}

export async function createPaymentMethod(
  projectId: number,
  payload: CreatePaymentMethodDTO
) {
  if (payload.type !== "wallet" && payload.type !== "bank") {
    throw new AppError("Type must be either 'wallet' or 'bank'", 400);
  }

  const [result] = await db
    .insert(paymentMethods)
    .values({
      projectId,
      name: payload.name,
      type: payload.type,
      logoUrl: payload.logoUrl || null,
    });

  return await getPaymentMethodById(projectId, result.insertId);
}

export async function getPaymentMethods(projectId: number) {
  return await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.projectId, projectId));
}

export async function getPaymentMethodById(projectId: number, id: number) {
  const result = await db
    .select()
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, id),
        eq(paymentMethods.projectId, projectId)
      )
    );

  return result[0];
}

export async function updatePaymentMethod(
  projectId: number,
  id: number,
  payload: Partial<CreatePaymentMethodDTO>
) {
  const existing = await getPaymentMethodById(projectId, id);

  if (!existing) {
    throw new AppError("Payment method not found", 404);
  }

  if (payload.type !== undefined && payload.type !== "wallet" && payload.type !== "bank") {
    throw new AppError("Type must be either 'wallet' or 'bank'", 400);
  }

  await db
    .update(paymentMethods)
    .set({
      name: payload.name !== undefined ? payload.name : existing.name,
      type: payload.type !== undefined ? payload.type : existing.type,
      logoUrl: payload.logoUrl !== undefined ? payload.logoUrl : existing.logoUrl,
    })
    .where(
      and(
        eq(paymentMethods.id, id),
        eq(paymentMethods.projectId, projectId)
      )
    );

  return await getPaymentMethodById(projectId, id);
}

export async function deletePaymentMethod(projectId: number, id: number) {
  const existing = await getPaymentMethodById(projectId, id);

  if (!existing) {
    throw new AppError("Payment method not found", 404);
  }

  await db
    .delete(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, id),
        eq(paymentMethods.projectId, projectId)
      )
    );

  return existing;
}
