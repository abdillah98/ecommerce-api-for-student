import { eq } from "drizzle-orm";
import { db } from "../../database/db.js";
import { projects } from "../../database/schema/projects.js";

interface CreateProjectDTO {
  projectTitle: string;
  projectDescription?: string;
  projectClass: string;

  projectTeam: {
    name: string;
    nim: string;
  }[];
}

export async function createProject(
  payload: CreateProjectDTO
) {

  const result = await db
    .insert(projects)
    .values({
      projectTitle: payload.projectTitle,
      projectDescription:payload.projectDescription,
      projectClass: payload.projectClass,
      projectTeam: JSON.stringify(payload.projectTeam)
    })
    .returning();

  return result[0];
}

export async function getProjects() {

  return await db
    .select()
    .from(projects);
}

export async function getProjectById(
  id: number
) {

  const result = await db
    .select()
    .from(projects)
    .where(
      eq(projects.id, id)
    );

  return result[0];
}

export async function updateProject(
  id: number,
  payload: CreateProjectDTO
) {

  const result = await db
    .update(projects)
    .set({
      projectTitle: payload.projectTitle,

      projectDescription:
        payload.projectDescription,

      projectClass: payload.projectClass,

      projectTeam: JSON.stringify(
        payload.projectTeam
      )
    })
    .where(
      eq(projects.id, id)
    )
    .returning();

  return result[0];
}

export async function deleteProject(
  id: number
) {

  const result = await db
    .delete(projects)
    .where(
      eq(projects.id, id)
    )
    .returning();

  return result[0];
}