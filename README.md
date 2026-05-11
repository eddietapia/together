# Together

A reviewer workflow for AI-generated biomedical research files. Reviewers preview proposed vs current versions of images, CSVs, JSON configs, and Markdown reports, leave threaded comments, approve/reject each file, and merge approved changes into the trusted Project Files with an audit trail.

Built with React + TypeScript + Tailwind on the frontend, Express + TypeScript on the backend, and wrapped in Electron as a desktop app.

---

## How to Run

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

### Web (frontend + backend)
```bash
npm run dev
```
- Frontend: http://localhost:5174
- Backend: http://localhost:3001 (proxied at `/api` from the frontend)

### Desktop (Electron)
Recommended so you can also see the menu bar functionality :) 
```bash
npm run electron:start
```

### Reset data to seed state
```bash
npm run reset
```

---

## Key Design Decisions

- **Virus metaphor as the review dashboard** — Each pending submission is a "spike" on an interactive virus model. Reviewing & merging submissions removes spikes, making progress tangible and gamified. Chose this to make a potentially tedious review flow feel engaging.
- **Focused on UX over file merging** - Wanted to make reviewing engaging and bio related.
- **Called these reviews Checkpoints** - Modeled after cell cycle checkpoints. Coining language to an app can make features feel more special (like Snap with streaks or Apple with rings)
- **Category-based triage (high-impact / conflicting / low-risk)** — Submissions are auto-categorized so reviewers can prioritize dangerous changes first. Reasoning: trying to make it more manageable for human reviewers to tackle the list of changes.
- **All one language: Typescript ** — It's always nice to have less context switching.
- **SQLite (better-sqlite3) as the persistence layer** — Zero-config, file-based DB that ships with the Electron app without requiring a remote database. Seed data (`seed-data/`) is bootstrapped on first run.
- **Desktop app with menu bar** - Wanted to give users the ability to easily view pending checkpoint reviews so they 

---

## AI Tool Usage

<!-- Be honest about what helped and what didn't -->

### Tools used
- **Claude Code** — For iterating on changes
- **My own custom built cloud Agent Development Environment** - UI layer on top of OpenCode to multi-task easily
- **Pen and paper** - For brainstorming

### What worked well
- AI for code generation is great :) 
- Iterating on visual polish was fun 
- Monorepo to easily test everything in one place
- Isolated things so I could work on multiple things at once.

### Where I had to take over
- UI polish: AI output needed significant rework.
- Virus visual: Was hard to get this right and took a lot of different prompts.

---

## What I'd Improve With More Time
Everything lol but highest priority would be:
- **Merge logic** - I didn't get to handling this, but I want to build a fun reward / competition for merges to make it engaging.
- **Add a Multiplayer mode** — Didn't get to this part.
- **Diff viewer** — This needs a lot of work for it to feel great.
- **Automated test suite** — Tests are great but didn't get to it.
- **Finish the implementation end to end**

---

## Architecture

```
together/
├── package.json        # Workspaces + orchestration scripts
├── seed-data/          # Initial manifest + file fixtures
├── frontend/           # React + Vite app
│   └── src/
│       ├── components/ # Home (VirusBoard, SpikeTask, …), FilePreview, Submissions, ProjectFiles
│       ├── hooks/      # useLocalStorage, …
│       ├── types/      # Submission, SubmissionFile, …
│       └── lib/        # Shared utils
├── backend/            # Express + TypeScript API
│   └── src/
│       ├── routes/     # submissions.ts, projectFiles.ts
│       ├── db.ts       # better-sqlite3 setup
│       └── bootstrap.ts# Seed-data ingestion
└── electron/           # Electron desktop wrapper
```

## Stack

| Layer    | Tech |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite, Framer Motion |
| Backend  | Node, Express, TypeScript, better-sqlite3 |
| Desktop  | Electron 28 |
| Icons    | Lucide React |
