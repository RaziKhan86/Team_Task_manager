import Project from "../models/Project.js";
import Task from "../models/Task.js";

const populateProject = (query) =>
  query.populate("owner", "name email role").populate("members", "name email role");

export const listProjects = async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? { $or: [{ owner: req.user._id }, { members: req.user._id }] }
      : { members: req.user._id };

  const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }));
  res.json(projects);
};

export const createProject = async (req, res) => {
  const { name, description, members = [] } = req.body;
  const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: uniqueMembers
  });

  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json(populated);
};

export const getProject = async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const canView =
    req.user.role === "admin" ||
    project.members.some((member) => member._id.equals(req.user._id));

  if (!canView) {
    res.status(403);
    throw new Error("You do not have access to this project");
  }

  res.json(project);
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!project.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("Only project owner can update this project");
  }

  project.name = req.body.name ?? project.name;
  project.description = req.body.description ?? project.description;
  project.members = req.body.members
    ? [...new Set([...req.body.members, req.user._id.toString()])]
    : project.members;

  await project.save();

  const populated = await populateProject(Project.findById(project._id));
  res.json(populated);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!project.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("Only project owner can delete this project");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: "Project deleted" });
};
