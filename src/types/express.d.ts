declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      projectId: number;
      role: string;
    };
  }
}