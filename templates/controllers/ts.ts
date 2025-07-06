import { Request, Response, NextFunction } from "express";
import { ApiResponse, AsyncHandler } from "../utils/ApiHelpers";

const healthCheck = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(new ApiResponse(200, {}, "Server is healthy"));
  }
);

export { healthCheck };