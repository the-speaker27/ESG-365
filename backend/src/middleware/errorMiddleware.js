import multer from "multer";
import HttpError from "../utils/HttpError.js";

export function notFound(_request, _response, next) {
  next(new HttpError(404, "API route not found."));
}

export function errorHandler(error, _request, response, _next) {
  let status = error.status || 500;
  let message = error.message || "An unexpected server error occurred.";

  if (error instanceof multer.MulterError) {
    status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = error.code === "LIMIT_FILE_SIZE"
      ? `Evidence file exceeds the ${process.env.MAX_UPLOAD_MB || 10} MB limit.`
      : "The evidence upload could not be processed.";
  }

  if (status >= 500) {
    console.error(error);
    message = "An unexpected server error occurred.";
  }

  response.status(status).json({ success: false, message });
}
