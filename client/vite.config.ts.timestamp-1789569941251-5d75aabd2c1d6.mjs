// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/Projects/BharatFarm/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projects/BharatFarm/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VitePWA } from "file:///D:/Projects/BharatFarm/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\Projects\\BharatFarm\\client";
var __vite_injected_original_import_meta_url = "file:///D:/Projects/BharatFarm/client/vite.config.ts";
var workspaceRoot = path.resolve(path.dirname(fileURLToPath(__vite_injected_original_import_meta_url)), "..");
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, "");
  const apiPort = env.PORT || "3000";
  return {
    plugins: [
      react(),
      VitePWA({
        // Use injectManifest so our custom sw.ts (with push handlers) is the base
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "prompt",
        injectRegister: "script",
        includeAssets: [
          "favicon.png",
          "favicon-16.png",
          "icons/apple-touch-icon.png",
          "icons/icon-*.png"
        ],
        manifest: {
          name: "BharatFarm \u2013 Smart Agriculture",
          short_name: "BharatFarm",
          description: "Smart agriculture platform for farmers with climate intelligence, crop risk analysis, mandi intelligence, aggregation and Sahayak assistance.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#0d4a1e",
          background_color: "#0d4a1e",
          categories: ["agriculture", "productivity", "utilities"],
          lang: "en-IN",
          icons: [
            {
              src: "/icons/icon-32.png",
              sizes: "32x32",
              type: "image/png"
            },
            {
              src: "/icons/icon-96.png",
              sizes: "96x96",
              type: "image/png"
            },
            {
              src: "/icons/icon-144.png",
              sizes: "144x144",
              type: "image/png"
            },
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/icons/icon-384.png",
              sizes: "384x384",
              type: "image/png"
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/icons/icon-192-maskable.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "/icons/icon-512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        },
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          // Don't precache noise/large images from external URLs
          globIgnores: ["**/node_modules/**", "**/sw.js", "**/workbox-*.js"]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        "@core": path.resolve(__vite_injected_original_dirname, "./src/core")
      }
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxCaGFyYXRGYXJtXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcQmhhcmF0RmFybVxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3RzL0JoYXJhdEZhcm0vY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5cclxuY29uc3Qgd29ya3NwYWNlUm9vdCA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKSwgJy4uJyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCB3b3Jrc3BhY2VSb290LCAnJyk7XHJcbiAgY29uc3QgYXBpUG9ydCA9IGVudi5QT1JUIHx8ICczMDAwJztcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgVml0ZVBXQSh7XHJcbiAgICAgICAgLy8gVXNlIGluamVjdE1hbmlmZXN0IHNvIG91ciBjdXN0b20gc3cudHMgKHdpdGggcHVzaCBoYW5kbGVycykgaXMgdGhlIGJhc2VcclxuICAgICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxyXG4gICAgICAgIHNyY0RpcjogJ3NyYycsXHJcbiAgICAgICAgZmlsZW5hbWU6ICdzdy50cycsXHJcbiAgICAgICAgcmVnaXN0ZXJUeXBlOiAncHJvbXB0JyxcclxuICAgICAgICBpbmplY3RSZWdpc3RlcjogJ3NjcmlwdCcsXHJcbiAgICAgICAgaW5jbHVkZUFzc2V0czogW1xyXG4gICAgICAgICAgJ2Zhdmljb24ucG5nJyxcclxuICAgICAgICAgICdmYXZpY29uLTE2LnBuZycsXHJcbiAgICAgICAgICAnaWNvbnMvYXBwbGUtdG91Y2gtaWNvbi5wbmcnLFxyXG4gICAgICAgICAgJ2ljb25zL2ljb24tKi5wbmcnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgICAgbmFtZTogJ0JoYXJhdEZhcm0gXHUyMDEzIFNtYXJ0IEFncmljdWx0dXJlJyxcclxuICAgICAgICAgIHNob3J0X25hbWU6ICdCaGFyYXRGYXJtJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU21hcnQgYWdyaWN1bHR1cmUgcGxhdGZvcm0gZm9yIGZhcm1lcnMgd2l0aCBjbGltYXRlIGludGVsbGlnZW5jZSwgY3JvcCByaXNrIGFuYWx5c2lzLCBtYW5kaSBpbnRlbGxpZ2VuY2UsIGFnZ3JlZ2F0aW9uIGFuZCBTYWhheWFrIGFzc2lzdGFuY2UuJyxcclxuICAgICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgICAgc2NvcGU6ICcvJyxcclxuICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgICAgICAgdGhlbWVfY29sb3I6ICcjMGQ0YTFlJyxcclxuICAgICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMGQ0YTFlJyxcclxuICAgICAgICAgIGNhdGVnb3JpZXM6IFsnYWdyaWN1bHR1cmUnLCAncHJvZHVjdGl2aXR5JywgJ3V0aWxpdGllcyddLFxyXG4gICAgICAgICAgbGFuZzogJ2VuLUlOJyxcclxuICAgICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0zMi5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnMzJ4MzInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi05Ni5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnOTZ4OTYnLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0xNDQucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzE0NHgxNDQnLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0xOTIucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0zODQucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzM4NHgzODQnLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi01MTIucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi0xOTItbWFza2FibGUucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICAgIHB1cnBvc2U6ICdtYXNrYWJsZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHNyYzogJy9pY29ucy9pY29uLTUxMi1tYXNrYWJsZS5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbmplY3RNYW5pZmVzdDoge1xyXG4gICAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYsd29mZjJ9J10sXHJcbiAgICAgICAgICAvLyBEb24ndCBwcmVjYWNoZSBub2lzZS9sYXJnZSBpbWFnZXMgZnJvbSBleHRlcm5hbCBVUkxzXHJcbiAgICAgICAgICBnbG9iSWdub3JlczogWycqKi9ub2RlX21vZHVsZXMvKionLCAnKiovc3cuanMnLCAnKiovd29ya2JveC0qLmpzJ11cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQGNvcmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29yZScpXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHthcGlQb3J0fWAsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUixTQUFTLGNBQWMsZUFBZTtBQUN2VCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsZUFBZTtBQUp4QixJQUFNLG1DQUFtQztBQUFnSSxJQUFNLDJDQUEyQztBQU0xTixJQUFNLGdCQUFnQixLQUFLLFFBQVEsS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQyxHQUFHLElBQUk7QUFFckYsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxlQUFlLEVBQUU7QUFDM0MsUUFBTSxVQUFVLElBQUksUUFBUTtBQUU1QixTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUE7QUFBQSxRQUVOLFlBQVk7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLFVBQVU7QUFBQSxRQUNWLGNBQWM7QUFBQSxRQUNkLGdCQUFnQjtBQUFBLFFBQ2hCLGVBQWU7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ1IsTUFBTTtBQUFBLFVBQ04sWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFVBQ2IsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUztBQUFBLFVBQ1QsYUFBYTtBQUFBLFVBQ2IsYUFBYTtBQUFBLFVBQ2Isa0JBQWtCO0FBQUEsVUFDbEIsWUFBWSxDQUFDLGVBQWUsZ0JBQWdCLFdBQVc7QUFBQSxVQUN2RCxNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLGNBQ04sU0FBUztBQUFBLFlBQ1g7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsY0FDTixTQUFTO0FBQUEsWUFDWDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQSxnQkFBZ0I7QUFBQSxVQUNkLGNBQWMsQ0FBQywyQ0FBMkM7QUFBQTtBQUFBLFVBRTFELGFBQWEsQ0FBQyxzQkFBc0IsWUFBWSxpQkFBaUI7QUFBQSxRQUNuRTtBQUFBLFFBQ0EsWUFBWTtBQUFBLFVBQ1YsU0FBUztBQUFBLFFBQ1g7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxTQUFTLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDL0M7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRLG9CQUFvQixPQUFPO0FBQUEsVUFDbkMsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
