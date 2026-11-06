# HRMS — Human Resource Management System

A complete basic HRMS covering the core hire-to-exit modules.

This folder contains a standalone React + TypeScript + Vite HRMS application, part of the Digital Nomad Portal project.

## Live demo

After enabling GitHub Pages (see below):

**https://isimelisavutini.github.io/Digital-Nomad-Portal/**

## Modules Included

| Module | Features |
|--------|----------|
| **Dashboard** | Headcount KPIs, leave queue, recruitment pipeline, department breakdown |
| **Employees** | Directory, search/filter, detailed profiles |
| **Recruitment** | Job openings + candidate pipeline |
| **Onboarding** | New-hire checklists with progress tracking |
| **Attendance** | Daily records, clock in/out, status |
| **Leave** | Request list, approve/reject workflow |
| **Payroll** | Run history, salary register |
| **Performance** | Goals with progress bars, review ratings |
| **Training** | Course catalog + assignments |
| **Settings** | Company info, leave policy, departments |

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS (CDN)
- Lucide React icons

## Quick Start (local)

```bash
cd hrms
npm install
npm run dev
```

Open http://localhost:5173

## Deploy / Host (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy-hrms.yml`) builds and deploys this app automatically on every push to `main` that touches `hrms/`.

### One-time setup (required)

1. Open **https://github.com/Isimelisavutini/Digital-Nomad-Portal/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Save
4. Re-run the workflow: **Actions → Deploy HRMS to GitHub Pages → Run workflow**

After that, the site is live at:

**https://isimelisavutini.github.io/Digital-Nomad-Portal/**

## Project Structure

```
hrms/
  src/
    App.tsx              # Layout + routing
    components/          # Module views
    types.ts             # TypeScript interfaces
    data.ts              # Sample seed data
    utils.ts             # Formatting helpers
    main.tsx             # Entry point
    index.css            # Base styles
  package.json
  vite.config.ts
  index.html
```
