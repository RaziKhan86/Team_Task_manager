const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
  /\/$/,
  ""
);

export const getStoredAuth = () => {
  const raw = localStorage.getItem("team-task-auth");
  return raw ? JSON.parse(raw) : null;
};

export const setStoredAuth = (auth) => {
  localStorage.setItem("team-task-auth", JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  localStorage.removeItem("team-task-auth");
};

export const request = async (path, options = {}) => {
  const auth = getStoredAuth();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
