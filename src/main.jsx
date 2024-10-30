import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css"; // Ensure this import is present

const root = createRoot(document.getElementById("root"));
root.render(<App />);
