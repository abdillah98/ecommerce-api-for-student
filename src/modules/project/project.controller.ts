import type { Request, Response } from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "./project.service.js";

import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";

function parseProject(project: any) {
  if (!project) return project;

  let team = project.projectTeam;
  
  // Rekursif unwrap jika string ter-serialisasi ganda (double-serialized JSON string)
  while (typeof team === "string") {
    try {
      const parsed = JSON.parse(team);
      if (parsed === team) {
        break; // Mencegah loop tak terbatas jika string hasil parse identik
      }
      team = parsed;
    } catch (e) {
      break; // Berhenti jika bukan string JSON yang valid
    }
  }

  return {
    ...project,
    projectTeam: team
  };
}

export const createProjectController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

  try {
    const project = await createProject(
      req.body
    );

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Failed to create project"
      });
    }

    return res.status(201).json({
      success: true,
      data: parseProject(project)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project"
    });
  }
});

export const getProjectsController = asyncHandler(async (
  req: Request,
  res: Response
) => {

  try {
    const data = await getProjects();

    return res.json({
      success: true,
      data: data.map(parseProject)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get projects"
    });
  }
});

export const getProjectByIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {

  try {
    const id = Number(req.params.id);

    const project =
      await getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    return res.json({
      success: true,
      data: parseProject(project)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get project"
    });
  }
});

export const updateProjectController = asyncHandler(async (
  req: Request,
  res: Response
) => {

  try {
    const id = Number(req.params.id);

    const project =
      await updateProject(
        id,
        req.body
      );

    return res.json({
      success: true,
      data: parseProject(project)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project"
    });
  }
});

export const deleteProjectController = asyncHandler(async (
  req: Request,
  res: Response
) => {

  try {
    const id = Number(req.params.id);

    const project =
      await deleteProject(id);

    return res.json({
      success: true,
      data: parseProject(project)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project"
    });
  }
});