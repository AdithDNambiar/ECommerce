const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  };
};

const setAuthCookies = (res, accessToken, refreshToken = null) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed
    });

    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await Token.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Not an admin" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await Token.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const stored = await Token.findOne({ token });

    if (!stored) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (stored.expiresAt && stored.expiresAt < new Date()) {
      await Token.deleteOne({ token });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = createAccessToken(user);

    setAuthCookies(res, accessToken);

    res.json({
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(403).json({ message: "Token expired" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await Token.deleteOne({ token });
    }

    const cookieOptions = getCookieOptions();

    res.clearCookie("accessToken", {
  httpOnly: true,
  secure: false,
  sameSite: "lax"
});

res.clearCookie("refreshToken", {
  httpOnly: true,
  secure: false,
  sameSite: "lax"
});

    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id role name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};