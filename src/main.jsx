import React from "react";
import { createRoot } from "react-dom/client";
import PreviewApp from "../components/PreviewApp";
import { AuthProvider } from "./lib/AuthContext";
import "../app/landing.css";
import "../app/demo-dashboard.css";
import "../app/onboarding.css";
import "../app/dark.css";
import "../app/mobile.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><AuthProvider><PreviewApp /></AuthProvider></React.StrictMode>
);
