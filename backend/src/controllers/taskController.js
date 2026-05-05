import Project from "../models/Project.js";
import Task from "../models/Task.js";

const populateTask = (query) =>
  query
    .populate("project", "name")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

const assertProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const isMember = project.members.some((member) => member.equals(user._id));
  const isOwner = project.owner.equals(user._id);

  if (!isMember && !isOwner) {
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  return project;
};

export const listTasks = async (req, res) => {
  const { project, status, assignedTo } = req.query;
  const filter = {};

  const projectFilter =
    req.user.role === "admin"
      ? { $or: [{ owner: req.user._id }, { members: req.user._id }] }
      : { members: req.user._id };
  const accessibleProjects = await Project.find(projectFilter).select("_id");
  const accessibleProjectIds = accessibleProjects.map((item) => item._id);

  if (project) {
    await assertProjectAccess(project, req.user);
    filter.project = project;
  } else {
    filter.project = { $in: accessibleProjectIds };
  }

  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (req.user.role !== "admin") {
    filter.assignedTo = req.user._id;
  }

  const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1 }));
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const project = await assertProjectAccess(req.body.project, req.user);

  if (!project.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("Only project owner can create tasks");
  }

  const isAssigneeMember = project.members.some((member) =>
    member.equals(req.body.assignedTo)
  );

  if (!isAssigneeMember) {
    res.status(400);
    throw new Error("Assigned user must be a project member");
  }

  const task = await Task.create({
    ...req.body,
    createdBy: req.user._id
  });

  const populated = await populateTask(Task.findById(task._id));
  res.status(201).json(populated);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await assertProjectAccess(task.project, req.user);
  const isOwner = project.owner.equals(req.user._id);
  const isAssignee = task.assignedTo.equals(req.user._id);

  if (!isOwner && !isAssignee) {
    res.status(403);
    throw new Error("You cannot update this task");
  }

  if (isOwner) {
    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.assignedTo = req.body.assignedTo ?? task.assignedTo;
    task.priority = req.body.priority ?? task.priority;
    task.dueDate = req.body.dueDate ?? task.dueDate;
  }

  task.status = req.body.status ?? task.status;
  await task.save();

  const populated = await populateTask(Task.findById(task._id));
  res.json(populated);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await assertProjectAccess(task.project, req.user);

  if (!project.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("Only project owner can delete tasks");
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
};
