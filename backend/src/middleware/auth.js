const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const sql = req.app.locals.sql;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    const users = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district
      FROM users
      WHERE id = ${decoded.userId}
    `;

    if (!users[0]) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = { ...users[0], userId: users[0].id };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired" });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { authenticate };
module.exports.authenticate = authenticate;
