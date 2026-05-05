import User from "../models/User.js";
import { createToken } from "../utils/token.js";

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "member"
  });

  res.status(201).json({
    user: userResponse(user),
    token: createToken(user)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: userResponse(user),
    token: createToken(user)
  });
};

export const me = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};
