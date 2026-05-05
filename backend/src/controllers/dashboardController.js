import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getDashboard = async (req, res) => {
  const now = new Date();
  const projectFilter =
    req.user.role === "admin"
      ? { $or: [{ owner: req.user._id }, { members: req.user._id }] }
      : { members: req.user._id };

  const projects = await Project.find(projectFilter).select("_id");
  const projectIds = projects.map((project) => project._id);
  const taskFilter =
    req.user.role === "admin"
      ? { project: { $in: projectIds } }
      : { assignedTo: req.user._id };

  const [totalTasks, todo, inProgress, done, overdue, recentTasks] =
    await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "todo" }),
      Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      Task.countDocuments({ ...taskFilter, status: "done" }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: "done" },
        dueDate: { $lt: now }
      }),
      Task.find(taskFilter)
        .populate("project", "name")
        .populate("assignedTo", "name email")
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

  res.json({
    totalProjects: projectIds.length,
    totalTasks,
    status: {
      todo,
      inProgress,
      done
    },
    overdue,
    recentTasks
  });
};
