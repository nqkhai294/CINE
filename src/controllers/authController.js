const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyTurnstile = require("../utils/verifyTurnstile");

// Register a new user
module.exports.register = async (req, res) => {
  try {
    const { email, username, password, display_name, turnstileToken } =
      req.body;

    if (!turnstileToken) {
      return res.status(400).json({
        status: "error",
        message: "Yêu cầu xác thực CAPTCHA.",
      });
    }
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return res.status(403).json({
        status: "error",
        message: "Xác thực CAPTCHA thất bại. Vui lòng thử lại.",
      });
    }

    // Check body requirements
    if (!email || !username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email, username, and password are required.",
      });
    }

    // Check email and username existence
    const checkUser = await db.query(
      `SELECT * FROM users WHERE email = $1 OR username = $2`,
      [email, username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email or username already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into database
    const newUserQuery = {
      text: `INSERT INTO users (email, username, password_hash, display_name) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, username, email, display_name`,
      values: [email, username, hashedPassword, display_name || username],
    };

    const { rows: newUsers } = await db.query(newUserQuery);
    const newUser = newUsers[0];

    // Create Profile for the new user
    await db.query(`INSERT INTO user_profiles (user_id) VALUES ($1)`, [
      newUser.id,
    ]);

    res.status(201).json({
      result: { status: "ok", message: "User registered successfully." },
      data: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login a user
module.exports.login = async (req, res) => {
  try {
    const { username, password, turnstileToken } = req.body;

    if (!turnstileToken) {
      return res.status(400).json({
        status: "error",
        message: "Yêu cầu xác thực CAPTCHA.",
      });
    }
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return res.status(403).json({
        status: "error",
        message: "Xác thực CAPTCHA thất bại. Vui lòng thử lại.",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required.",
      });
    }

    // Find user by username
    const { rows } = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password.",
      });
    }

    const user = rows[0];
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password.",
      });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond with token
    res.status(200).json({
      result: { status: "ok", message: "Login successful." },
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
