import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import User from "./models/User.js";

dotenv.config();

const runSeed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);

  const [admin, memberOne, memberTwo] = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    },
    {
      name: "Priya Member",
      email: "priya@example.com",
      password: "password123",
      role: "member"
    },
    {
      name: "Rahul Member",
      email: "rahul@example.com",
      password: "password123",
      role: "member"
    }
  ]);

  const project = await Project.create({
    name: "Website Launch",
    description: "Prepare the product website for launch week.",
    owner: admin._id,
    members: [admin._id, memberOne._id, memberTwo._id]
  });

  await Task.create([
    {
      title: "Create landing page copy",
      description: "Write clear headline, subcopy and feature points.",
      project: project._id,
      assignedTo: memberOne._id,
      createdBy: admin._id,
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Connect contact form API",
      description: "Submit leads to the backend and show success state.",
      project: project._id,
      assignedTo: memberTwo._id,
      createdBy: admin._id,
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log("Seed complete");
  console.log("Admin: admin@example.com / password123");
  console.log("Member: priya@example.com / password123");
  process.exit(0);
};

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
