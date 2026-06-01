import { eq } from "drizzle-orm";
import { db } from "../../database/db.js";
import { projects, type TeamMember } from "../../database/schema/projects.js";

interface CreateProjectDTO {
  projectTitle: string;
  projectDescription?: string;
  projectClass: string;
  projectTeam: TeamMember[];
}

export async function createProject(payload: CreateProjectDTO) {
  const [result] = await db
    .insert(projects)
    .values({
      projectTitle: payload.projectTitle,
      projectDescription: payload.projectDescription,
      projectClass: payload.projectClass,
      projectTeam: payload.projectTeam 
    });

  return await getProjectById(result.insertId);
}

export async function getProjects() {
  return await db.select().from(projects);
}

export async function getProjectById(id: number) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  return result[0];
}

export async function updateProject(id: number, payload: CreateProjectDTO) {
  await db
    .update(projects)
    .set({
      projectTitle: payload.projectTitle,
      projectDescription: payload.projectDescription,
      projectClass: payload.projectClass,
      projectTeam: payload.projectTeam
    })
    .where(eq(projects.id, id));

  return await getProjectById(id);
}

export async function deleteProject(id: number) {
  const existing = await getProjectById(id);
  await db
    .delete(projects)
    .where(eq(projects.id, id));

  return existing;
}