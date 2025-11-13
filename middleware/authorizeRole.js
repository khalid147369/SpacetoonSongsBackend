module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const User = require("../models/User");
    User.findById(req.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (allowedRoles.includes(user.role)) {
          req.userRole = user.role;
          next();
        } else {
          res
            .status(403)
            .json({ message: "Access denied. Insufficient permissions" });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  };
};
