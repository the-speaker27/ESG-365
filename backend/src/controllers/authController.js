import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";

export async function login(request, response) {
  const email = String(request.body?.email || "").trim().toLowerCase();
  const password = request.body?.password;
  if (!email || typeof password !== "string" || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  const [rows] = await pool.execute(
    "SELECT id, name, email, password_hash, role, project_id FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  const userRecord = rows[0];
  if (!userRecord || !(await bcrypt.compare(password, userRecord.password_hash))) {
    throw new HttpError(401, "Invalid email or password.");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
    throw new HttpError(500, "JWT_SECRET must be configured before logging in.");
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    projectId: userRecord.project_id,
  };
  const token = jwt.sign(
    { role: user.role, projectId: user.projectId },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "8h" },
  );

  response.json({ success: true, token, user });
}
