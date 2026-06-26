<div align="center">

<img src="public/feathermd.svg" alt="FeatherMD logo" width="80" />

# FeatherMD

**A lightweight Markdown editor with live preview, folder sidebar, and offline support.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **Live preview** | Write Markdown on the left, see it rendered on the right in real time |
| 📁 **Folder sidebar** | Open an entire directory and manage `.md` files like Obsidian *(Chrome/Edge)* |
| 💾 **Save to disk** | `Ctrl+S` writes directly to the file — no download dialogs |
| 🔒 **XSS protection** | All rendered HTML is sanitized with DOMPurify |
| 📱 **PWA** | Install on desktop from the browser, works fully offline |
| 🌗 **Dark / Light mode** | Persisted in `localStorage` |
| 🗂️ **Single file mode** | Open and download individual `.md` files — works in all browsers |

---

## 🖥️ Screenshots

> *Split-pane editor with live preview and folder sidebar (Chrome/Edge)*

```
┌─────────────────────────────────────────────────────────┐
│  🪶 FeatherMD          [📁] [📄] [💾] [☀️]             │
├──────────────┬──────────────────┬───────────────────────┤
│ 📁 my-notes  │  ## Hello world  │  Hello world          │
│  • notes.md  │                  │                        │
│  • todo.md ● │  Some **bold**   │  Some bold text       │
│              │  text            │                        │
│  + New file  │                  │                        │
└──────────────┴──────────────────┴───────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Run locally

```bash
git clone https://github.com/RafaelBissoDias/feather-md.git
cd feather-md
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Run with Docker

```bash
docker build -t feathermd .
docker run -p 8080:80 feathermd
```

Open [http://localhost:8080](http://localhost:8080).

---

## 🗂️ Project Structure

```
feather-md/
├── public/
│   ├── feathermd.svg          # Source icon (SVG)
│   ├── favicon.png
│   └── icons/                 # PWA icons (192, 512, apple-touch)
│
├── src/
│   ├── components/
│   │   ├── Editor.tsx          # Markdown textarea
│   │   ├── Preview.tsx         # Sanitized HTML renderer
│   │   ├── Toolbar.tsx         # Top bar with action buttons
│   │   ├── Sidebar.tsx         # Folder file list (File System Access API)
│   │   ├── FolderPermissionDialog.tsx  # Pre-permission dialog
│   │   ├── HelpModal.tsx       # FAQ / security info modal
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── hooks/
│   │   ├── useEditor.ts        # Content state, theme, single-file I/O
│   │   └── useFileSystem.ts    # Directory handle, folder CRUD operations
│   │
│   ├── lib/
│   │   └── utils.ts            # cn() utility
│   │
│   ├── App.tsx                 # Root layout, dialog orchestration
│   ├── main.tsx                # Entry point, theme init, providers
│   └── index.css               # Tailwind v4 + shadcn theme + dark/light vars
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Type check + build + Docker build on push/PR
│
├── scripts/
│   └── generate-icons.mjs     # One-time script: SVG → PNG icons via sharp
│
├── Dockerfile                  # Multi-stage: node:24 build → nginx:alpine serve
└── nginx.conf                  # SPA routing, gzip, security headers, asset caching
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript 6** — component architecture and type safety
- **Vite 8** — fast dev server and optimized production build
- **Tailwind CSS v4** — utility-first styling with dark mode via CSS class
- **shadcn/ui** (Base UI) — accessible, unstyled components (Button, Dialog, Tooltip...)
- **Marked** — Markdown → HTML parser
- **DOMPurify** — sanitizes rendered HTML to prevent XSS attacks
- **lucide-react** — icon library

### PWA
- **vite-plugin-pwa** — generates service worker, web manifest, and precache config
- Installable from Chrome/Edge address bar — works fully offline after install

### DevOps
- **Dockerfile** (multi-stage)
  - Stage 1 `builder`: `node:24-alpine` — installs dependencies and runs `npm run build`
  - Stage 2 `runner`: `nginx:alpine` — serves the static `dist/` folder
- **nginx.conf**
  - SPA fallback (`try_files $uri /index.html`)
  - Gzip compression for JS/CSS/HTML
  - Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  - Immutable cache for hashed assets, no-cache for `sw.js`
- **GitHub Actions** (`ci.yml`)
  - Runs on every push and PR to `main`
  - Steps: `tsc --noEmit` → `npm run build` → `docker build` (smoke test)

---

## 🔒 Security

FeatherMD is **100% client-side**. No data is ever sent to a server.

### File System Access API
Folder access uses the browser's native [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). The browser enforces the sandbox — the app can only access the folder the user explicitly chose. The permission dialog is shown before the native folder picker so users understand what they are granting.

### XSS Prevention
All Markdown is parsed and then passed through `DOMPurify.sanitize()` before being set as `innerHTML`. This ensures malicious scripts inside `.md` files cannot execute.

### Browser Compatibility

| Browser | Single file | Folder sidebar |
|---|---|---|
| Chrome / Edge | ✅ | ✅ |
| Brave | ✅ | ⚠️ Disable Shields |
| Firefox / Safari | ✅ | ❌ Not supported |

---

## 📦 Install as Desktop App (PWA)

1. Open the app in **Chrome** or **Edge**
2. Click the **install icon** in the address bar (or browser menu → *Install FeatherMD*)
3. The app launches as a standalone window with full folder sidebar support

---

## 📄 License

MIT © [Rafael Bissa Dias](https://github.com/RafaelBissoDias)
