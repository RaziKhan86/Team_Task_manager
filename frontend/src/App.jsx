import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Shield,
  Users
} from "lucide-react";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { clearStoredAuth, getStoredAuth, request, setStoredAuth } from "./api";

const emptyProject = { name: "", description: "", members: [] };
const emptyTask = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  priority: "medium",
  dueDate: ""
};

function App() {
  const [auth, setAuth] = useState(getStoredAuth());
  const [view, setView] = useState("dashboard");
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = auth?.user?.role === "admin";

  const activeProject = useMemo(
    () => projects.find((project) => project._id === taskForm.project),
    [projects, taskForm.project]
  );

  const assignableUsers = activeProject?.members?.length ? activeProject.members : users;

  const loadData = async () => {
    if (!auth?.token) return;

    setLoading(true);
    setMessage("");
    try {
      const [dashboardData, projectData, taskData, userData] = await Promise.all([
        request("/dashboard"),
        request("/projects"),
        request("/tasks"),
        request("/users")
      ]);

      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      setUsers(userData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auth?.token]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload =
        mode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;
      const data = await request(`/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setStoredAuth(data);
      setAuth(data);
      setView("dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
    setDashboard(null);
    setProjects([]);
    setTasks([]);
  };

  const createProject = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await request("/projects", {
        method: "POST",
        body: JSON.stringify(projectForm)
      });
      setProjectForm(emptyProject);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await request("/tasks", {
        method: "POST",
        body: JSON.stringify(taskForm)
      });
      setTaskForm(emptyTask);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    setMessage("");
    try {
      await request(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      await loadData();
    } catch (error) {
      setMessage(error.message);
      await loadData();
    }
  };

  const removeTask = async (taskId) => {
    setMessage("");
    try {
      await request(`/tasks/${taskId}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setMessage(error.message);
      await loadData();
    }
  };

  const deleteProject = async (projectId) => {
    setMessage("");
    try {
      await request(`/projects/${projectId}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!auth) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">MERN Stack</p>
            <h1>Team Task Manager</h1>
            <p className="muted">
              Projects, team members, tasks, progress and role-based access in one
              workspace.
            </p>
          </div>

          <form className="form" onSubmit={submitAuth}>
            <div className="segmented">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
              >
                Signup
              </button>
            </div>

            {mode === "signup" && (
              <>
                <label>
                  Name
                  <input
                    value={authForm.name}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, name: event.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Role
                  <select
                    value={authForm.role}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, role: event.target.value })
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            )}

            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                minLength={6}
                required
              />
            </label>

            {message && <p className="error">{message}</p>}
            <button className="primary" type="submit">
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <FolderKanban size={28} />
          <div>
            <strong>Task Manager</strong>
            <span>{auth.user.role}</span>
          </div>
        </div>
        <nav>
          <NavButton
            icon={<LayoutDashboard />}
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </NavButton>
          <NavButton
            icon={<FolderKanban />}
            active={view === "projects"}
            onClick={() => setView("projects")}
          >
            Projects
          </NavButton>
          <NavButton
            icon={<CheckCircle2 />}
            active={view === "tasks"}
            onClick={() => setView("tasks")}
          >
            Tasks
          </NavButton>
          <NavButton
            icon={<Users />}
            active={view === "team"}
            onClick={() => setView("team")}
          >
            Team
          </NavButton>
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome, {auth.user.name}</p>
            <h1>{titleFor(view)}</h1>
          </div>
          <button className="ghost" onClick={loadData}>
            Refresh
          </button>
        </header>

        {message && <p className="error">{message}</p>}
        {loading && <p className="muted">Loading data...</p>}

        {view === "dashboard" && (
          <Dashboard dashboard={dashboard} recentTasks={dashboard?.recentTasks || []} />
        )}

        {view === "projects" && (
          <Projects
            isAdmin={isAdmin}
            projects={projects}
            users={users}
            form={projectForm}
            setForm={setProjectForm}
            onSubmit={createProject}
            onDelete={deleteProject}
          />
        )}

        {view === "tasks" && (
          <Tasks
            isAdmin={isAdmin}
            tasks={tasks}
            projects={projects}
            users={assignableUsers}
            form={taskForm}
            setForm={setTaskForm}
            onSubmit={createTask}
            onStatus={updateTaskStatus}
            onDelete={removeTask}
          />
        )}

        {view === "team" && <Team users={users} />}
      </section>
    </main>
  );
}

function NavButton({ icon, active, children, onClick }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

function Dashboard({ dashboard, recentTasks }) {
  const stats = [
    ["Projects", dashboard?.totalProjects || 0, <FolderKanban />],
    ["Total Tasks", dashboard?.totalTasks || 0, <CheckCircle2 />],
    ["In Progress", dashboard?.status?.inProgress || 0, <Clock3 />],
    ["Overdue", dashboard?.overdue || 0, <Shield />]
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map(([label, value, icon]) => (
          <article className="stat-card" key={label}>
            {icon}
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>Recent Tasks</h2>
        <TaskList tasks={recentTasks} readonly />
      </section>
    </>
  );
}

function Projects({ isAdmin, projects, users, form, setForm, onSubmit, onDelete }) {
  return (
    <div className="split">
      {isAdmin && (
        <section className="panel">
          <h2>Create Project</h2>
          <form className="form compact" onSubmit={onSubmit}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <label>
              Members
              <select
                multiple
                value={form.members}
                onChange={(event) =>
                  setForm({
                    ...form,
                    members: Array.from(event.target.selectedOptions, (item) => item.value)
                  })
                }
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" type="submit">
              <Plus size={18} /> Add Project
            </button>
          </form>
        </section>
      )}
      <section className="panel wide">
        <h2>Projects</h2>
        <div className="item-list">
          {projects.map((project) => (
            <article className="item-card" key={project._id}>
              <div>
                <strong>{project.name}</strong>
                <p>{project.description || "No description"}</p>
                <span>{project.members?.length || 0} members</span>
              </div>
              {isAdmin && (
                <button className="danger" onClick={() => onDelete(project._id)}>
                  Delete
                </button>
              )}
            </article>
          ))}
          {!projects.length && <p className="muted">No projects yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Tasks({ isAdmin, tasks, projects, users, form, setForm, onSubmit, onStatus, onDelete }) {
  return (
    <div className="split">
      {isAdmin && (
        <section className="panel">
          <h2>Create Task</h2>
          <form className="form compact" onSubmit={onSubmit}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </label>
            <label>
              Project
              <select
                value={form.project}
                onChange={(event) =>
                  setForm({ ...form, project: event.target.value, assignedTo: "" })
                }
                required
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assign To
              <select
                value={form.assignedTo}
                onChange={(event) =>
                  setForm({ ...form, assignedTo: event.target.value })
                }
                required
              >
                <option value="">Select member</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Due Date
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <button className="primary" type="submit">
              <Plus size={18} /> Add Task
            </button>
          </form>
        </section>
      )}
      <section className="panel wide">
        <h2>Tasks</h2>
        <TaskList
          tasks={tasks}
          isAdmin={isAdmin}
          onStatus={onStatus}
          onDelete={onDelete}
        />
      </section>
    </div>
  );
}

function TaskList({ tasks, readonly = false, isAdmin = false, onStatus, onDelete }) {
  return (
    <div className="item-list">
      {tasks.map((task) => (
        <article className="item-card task-card" key={task._id}>
          <div>
            <strong>{task.title}</strong>
            <p>{task.description || "No description"}</p>
            <span>
              {task.project?.name || "Project"} · {task.assignedTo?.name || "Member"} ·{" "}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
          {!readonly && (
            <div className="actions">
              <select
                value={task.status}
                onChange={(event) => onStatus(task._id, event.target.value)}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {isAdmin && (
                <button className="danger" onClick={() => onDelete(task._id)}>
                  Delete
                </button>
              )}
            </div>
          )}
        </article>
      ))}
      {!tasks.length && <p className="muted">No tasks found.</p>}
    </div>
  );
}

function Team({ users }) {
  return (
    <section className="panel">
      <h2>Team Members</h2>
      <div className="team-grid">
        {users.map((user) => (
          <article className="member-card" key={user._id}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <small>{user.role}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function titleFor(view) {
  return {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    team: "Team"
  }[view];
}

export default App;
