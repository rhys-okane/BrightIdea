import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@src": "/src",
			"@shared": path.resolve(import.meta.dirname, "../shared/src"),
			dgram: path.resolve(import.meta.dirname, "./src/shims/dgram.ts"),
		},
	},
	server: {
		host: true,
		allowedHosts: true,
	},
});
