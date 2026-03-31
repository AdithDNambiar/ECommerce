const Address = require("../models/Address");

// ADD ADDRESS
exports.addAddress = async (req, res) => {
  const address = await Address.create({
    ...req.body,
    user: req.user.id
  });

  res.json(address);
};

// GET ALL USER ADDRESSES
exports.getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user.id });
  res.json(addresses);
};

// DELETE ADDRESS
exports.deleteAddress = async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};