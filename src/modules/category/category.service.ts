import { eq, and } from "drizzle-orm";
import { db } from "../../database/db.js";
import { categories } from "../../database/schema/categories.js";
import { AppError } from "../../utils/app-error.js";

interface CreateCategoryDTO {
  categoryName: string;
}

export async function createCategory(
  projectId: number,
  payload: CreateCategoryDTO
) {
  const [result] = await db
    .insert(categories)
    .values({
      projectId,
      categoryName: payload.categoryName
    });

  return await getCategoryById(projectId, result.insertId);
}

export async function getCategories(
  projectId: number
) {
  return await db
    .select()
    .from(categories)
    .where(
      eq(
        categories.projectId,
        projectId
      )
    );
}

export async function getCategoryById(
  projectId: number,
  id: number
) {
  const result = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.id, id),
        eq(
          categories.projectId,
          projectId
        )
      )
    );

  return result[0];
}

export async function updateCategory(
  projectId: number,
  id: number,
  payload: CreateCategoryDTO
) {
  const existing = await getCategoryById(
    projectId,
    id
  );

  if (!existing) {
    throw new AppError(
      "Category not found",
      404
    );
  }

  await db
    .update(categories)
    .set({
      categoryName: payload.categoryName
    })
    .where(
      and(
        eq(categories.id, id),
        eq(
          categories.projectId,
          projectId
        )
      )
    );

  return await getCategoryById(projectId, id);
}

export async function deleteCategory(
  projectId: number,
  id: number
) {
  const existing = await getCategoryById(
    projectId,
    id
  );

  if (!existing) {
    throw new AppError(
      "Category not found",
      404
    );
  }

  await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, id),
        eq(
          categories.projectId,
          projectId
        )
      )
    );

  return existing;
}