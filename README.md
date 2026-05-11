# Together

A reviewer workflow for AI-generated biomedical research files. Reviewers preview proposed vs current versions of images, CSVs, JSON configs, and Markdown reports, leave threaded comments, approve/reject each file, and merge approved changes into the trusted Project Files with an audit trail.

Built with React + TypeScript + Tailwind on the frontend, Express + TypeScript on the backend, and wrapped in Electron as a desktop app.

---

## Getting Started

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

This installs frontend, backend, and electron workspaces in one go.

---

## Running the App

### Web (frontend + backend)
```bash
npm run dev
```
- Frontend: http://localhost:5174
- Backend:  http://localhost:3001 (proxied at `/api` from the frontend)

Or run them separately:
```bash
npm run dev:frontend
npm run dev:backend
```

### Desktop (Electron)
```bash
npm run electron:start
```
Builds the Electron shell, starts the frontend + backend dev servers, and launches the desktop window once the frontend is ready.

---

## Architecture

```
together/
├── package.json        # Workspaces + orchestration scripts
├── frontend/           # React + Vite app
│   └── src/
│       ├── components/ # UI components (Sidebar, ReviewInterface, SubmissionCard, …)
│       ├── hooks/      # useLocalStorage, …
│       ├── types/      # Submission, SubmissionFile, …
│       └── lib/        # Shared utils
├── backend/            # Express + TypeScript API
│   └── src/
│       └── server.ts   # Single /api/health endpoint to start
└── electron/           # Electron desktop wrapper
```

---

## Stack

| Layer    | Tech |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend  | Node, Express, TypeScript, tsx |
| Desktop  | Electron 28 |
| Icons    | Lucide React |
