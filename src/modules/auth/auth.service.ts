import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../../database/db.js";
import { users } from "../../database/schema/users.js";
import { projects } from "../../database/schema/projects.js";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/app-error.js";

interface RegisterDTO {
  projectId: number;
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export async function register(
  payload: RegisterDTO
) {

  const existingProject =
    await db
      .select()
      .from(projects)
      .where(
        eq(
          projects.id,
          payload.projectId
        )
      );

  if (!existingProject[0]) {

    throw new AppError(
      "Project not found",
      404
    );
  }

  const existingUser =
    await db
      .select()
      .from(users)
      .where(
        eq(
          users.email,
          payload.email
        )
      );

  if (existingUser[0]) {

    throw new AppError(
      "Email already registered",
      400
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      payload.password,
      10
    );

  const result =
    await db
      .insert(users)
      .values({
        projectId: payload.projectId,
        name: payload.name,
        email: payload.email,
        password: hashedPassword
      })
      .returning();

  const user = result[0];

  if (!user) {

    throw new AppError(
      "Failed to create user",
      500
    );
  }

  return {
    id: user.id,
    projectId: user.projectId,
    name: user.name,
    email: user.email
  };
}

export async function login(
  payload: LoginDTO
) {

  const result =
    await db
      .select()
      .from(users)
      .where(
        eq(
          users.email,
          payload.email
        )
      );

  const user = result[0];

  if (!user) {

    throw new AppError(
      "Invalid credentials",
      401
    );
  }

  const isMatch =
    await bcrypt.compare(
      payload.password,
      user.password
    );

  if (!isMatch) {

    throw new AppError(
      "Invalid credentials",
      401
    );
  }

  const token =
    generateToken({
      userId: user.id,
      projectId: user.projectId,
      role: user.role || "customer"
    });

  return {
    token,
    user: {
      id: user.id,
      projectId: user.projectId,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function getCurrentUser(
  userId: number
) {

  const result =
    await db
      .select()
      .from(users)
      .where(
        eq(users.id, userId)
      );

  const user = result[0];

  if (!user) {

    throw new AppError(
      "User not found",
      404
    );
  }

  return {
    id: user.id,
    projectId: user.projectId,
    name: user.name,
    email: user.email,
    role: user.role
  };
}