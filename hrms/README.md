# HRMS — Human Resource Management System

A complete basic HRMS covering the core hire-to-exit modules.

This folder contains a standalone React + TypeScript + Vite HRMS application, part of the Digital Nomad Portal project.

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

## Quick Start

```bash
cd hrms
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
hrms/
  src/
    App.tsx          # All module views + layout
    types.ts         # TypeScript interfaces
    data.ts          # Sample seed data
    utils.ts         # Formatting helpers
    main.tsx         # Entry point
    index.css        # Base styles
  package.json
  vite.config.ts
  index.html
```
