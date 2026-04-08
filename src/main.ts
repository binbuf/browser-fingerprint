import { mount } from "svelte";
import App from "./ui/App.svelte";
import { preferences } from "./ui/stores";

// Import global styles
import "./styles/global.css";
import "./styles/themes.css";
import "./styles/components.css";

// Initialize collectors (registers them in the central registry)
import "./collectors";

// Initialize UI preferences (theme, etc.)
preferences.init();

const target = document.getElementById("app");
if (!target) {
  throw new Error("Could not find #app mount point");
}

mount(App, { target });
