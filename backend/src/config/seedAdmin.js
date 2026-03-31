const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: "admin@shop.com" });

    if (!exists) {
      const hashed = await bcrypt.hash("admin123", 10);

      await User.create({
        name: "Admin",
        email: "admin@shop.com",
        password: hashed,
        role: "admin"
      });

      console.log("Admin created");
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = seedAdmin;