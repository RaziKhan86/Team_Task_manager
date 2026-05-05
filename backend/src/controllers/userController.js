import User from "../models/User.js";

export const listUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ name: 1 });
  res.json(users);
};
