export const apiBaseUrl = (process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "" : "https://espnapp.onrender.com")).replace(/\/+$/, "");
