# 🌌 Northgate Workspace

> **Measure progress. Build consistency.**  
> Northgate is a high-performance, offline-first personal workspace and productivity engine built with React, TypeScript, Dexie.js (IndexedDB), and GitHub API synchronization.

---

## ⚡ Features

- **🔒 Offline-First Architecture**: Powered by IndexedDB via Dexie.js. Your data stays local, private, and blazing fast.
- **🛡️ Web Crypto PAT Encryption**: Native browser encryption (PBKDF2 + AES-GCM 256-bit) to store your GitHub Personal Access Token securely without plaintext leaks.
- **📁 Projects as First-Class Entities**: Relational data model mapping Projects as parental containers for notes, tasks, and media resources.
- **🔄 GitHub Markdown Sync**: Seamlessly serializes notes and metadata into standard Markdown files with frontmatter and pushes them to your GitHub repository (`notes/YYYY/MM/YYYY-MM-DD/filename.md`).
- **📊 Productivity Analytics**: Track daily execution rates, weekly productivity velocity, active project goal progressions, and habit streaks.
- **🎨 Modern Dark Dashboard**: Sleek visual terminal interface styled with Emerald & subtle Blue highlights using Tailwind CSS and Recharts.

---

## 📂 Project Structure

```text
northgate-app/
├── index.html               # App root HTML container
├── package.json             # Project dependencies and build scripts
├── tailwind.config.js       # Tailwind CSS design system configuration
├── postcss.config.js        # PostCSS configuration for Tailwind
├── tsconfig.json            # TypeScript strict rules configuration
├── vite.config.ts           # Vite build runner config
└── src/
    ├── main.tsx             # React DOM application entry point
    ├── App.tsx              # Root app component wrapper
    ├── index.css            # Global Tailwind CSS imports
    ├── database/
    │   ├── schema.ts        # TypeScript interfaces for DB entities
    │   └── dexie.ts         # Dexie.js IndexedDB client & schema definition
    ├── utils/
    │   └── crypto.ts        # Web Crypto API utilities (AES-GCM / PBKDF2)
    ├── store/
    │   └── useNorthgateStore.ts # Zustand global state & reactive DB sync
    ├── services/
    │   └── github.ts        # Background GitHub sync pipeline & MD serialization
    └── pages/
        └── Dashboard/
            └── Dashboard.tsx # Main analytical terminal UI

