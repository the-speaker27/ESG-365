import jwt from "jsonwebtoken";
import HttpError from "../utils/HttpError.js";

export default function authenticate(request, response, next) {
  const authorization = request.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) return next(new HttpError(401, "Authentication is required."));

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    request.user = {
      id: Number(claims.sub),
      role: claims.role,
      projectId: claims.projectId == null ? null : Number(claims.projectId),
    };
    next();
  } catch {
    next(new HttpError(401, "Your session is invalid or has expired. Please sign in again."));
  }
}
