import { ApiResponse, AsyncHandler } from "../utils/ApiHelpers.js";

const healthCheck = AsyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {}, "Server is healthy"));
});

export { healthCheck };