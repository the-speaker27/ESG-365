import HttpError from "../utils/HttpError.js";

export default function allowRoles(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action."));
    }
    next();
  };
}
