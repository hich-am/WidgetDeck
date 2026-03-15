# WidgetDeck

A futuristic, draggable productivity dashboard built with Next.js. Think Notion meets a developer control panel — manage tasks, notes, habits, and more through customizable, resizable widgets on a grid.

## Features

- **Draggable & Resizable Widgets** — Arrange your workspace however you want
- **Layout Persistence** — Widget positions and sizes save to localStorage automatically
- **Command Palette** — `Ctrl+K` / `⌘K` to quickly navigate and run actions
- **Widget Toggle** — Enable/disable widgets from the toolbar
- **Dark Mode First** — Sleek, futuristic design inspired by Linear and Vercel

## Widgets

| Widget | Description |
|--------|-------------|
| **Tasks** | Todo list with priorities (low/medium/high), checkboxes, and delete |
| **Notes** | Multi-note scratchpad with sidebar navigation and auto-save |
| **Calendar** | Month view with event creation, navigation, and event dots |
| **Lists** | Create custom named lists with checkable items |
| **Pomodoro** | 25/5 min focus timer with circular progress and session tracking |
| **Habits** | Daily habit tracker with 7-day grid and streak counter |
| **Bookmarks** | Save and organize links with favicon previews |

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Grid System:** react-grid-layout
- **State:** Zustand (with localStorage persistence)
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── globals.css         # Theme tokens + grid layout styles
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Dashboard page
├── components/
│   ├── layout/             # Dashboard shell
│   │   ├── DashboardGrid   # Responsive grid with react-grid-layout
│   │   ├── WidgetContainer # Card chrome, drag handle, expand button
│   │   ├── ExpandedWidget  # Fullscreen modal overlay
│   │   ├── Toolbar         # Top bar with controls
│   │   └── GridBackground  # SVG grid pattern
│   ├── widgets/            # All 7 productivity widgets
│   └── CommandPalette.tsx  # Ctrl+K command palette
├── config/widgets.ts       # Widget definitions + default layouts
├── hooks/                  # Custom hooks
├── store/
│   ├── dashboardStore.ts   # Layout & UI state
│   └── contentStore.ts     # All user data (tasks, notes, etc.)
└── types/widget.ts         # TypeScript types
```

## License

Manseur Hicham