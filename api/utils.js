function requireUser(req, res, next) {
  if (!req.user) {
    next({
      error: "Error!",
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
      status: 401,
    });
  }

  next();
}

module.exports = {
  requireUser,
};