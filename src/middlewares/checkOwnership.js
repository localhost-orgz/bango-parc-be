export const checkOwnership = ({
  model,
  ownerField = "userId",
  resourceIdParam = "id",
}) => {
  return async (req, res, next) => {
    try {
      const resourceId = Number(req.params[resourceIdParam]);
      const resource = await model.findUnique({
        where: {
          id: resourceId,
        },
      });

      if (!resource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      // Allow if user is owner or ADMIN
      if (resource[ownerField] !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      req.resource = resource;

      next();
    } catch (error) {
      next(error);
    }
  };
};
