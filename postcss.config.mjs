import { fileURLToPath } from "node:url";

// Absolute config path so the build works no matter which directory it is started from.
const tailwindConfig = fileURLToPath(new URL("./tailwind.config.ts", import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
};
