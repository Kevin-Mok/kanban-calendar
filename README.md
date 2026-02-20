# Calendar Kanban Board

A responsive calendar application with draggable events and smooth transitions, built with Next.js 15, TypeScript, and Tailwind CSS 4. Features Atlassian's drag-and-drop library and Framer Motion animations.

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_App-blue?style=for-the-badge&logo=vercel)](https://kanban-calendar-lake.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Overview

A modern calendar app that provides a seamless experience across desktop and mobile. Desktop shows full week view with keyboard navigation; mobile offers single-day view with swipe gestures and infinite scrolling.

## Features

### Responsive Design
- **Desktop**: Full week view with 7 columns, left/right navigation
- **Mobile**: Single day view with horizontal swiping (<768px breakpoint)
- **Auto-detect**: Automatic layout switching based on screen width

### Interactions
- **Drag-and-Drop** - Move events between days using @atlaskit/pragmatic-drag-and-drop
- **Card-to-Detail** - Smooth Framer Motion animations when expanding events
- **Swipe Navigation** - Touch gestures with 50px threshold on mobile
- **Keyboard Navigation** - Arrow keys to navigate weeks on desktop

### Visual Polish
- **Shared Layout Animations** - Seamless transitions with layoutId
- **Dynamic Header** - Animated week header with day indicators
- **Hover Effects** - Subtle scale transforms on event cards
- **Blur Backgrounds** - Modal overlay with backdrop blur

## Demos

- [Desktop Demo](https://youtube.com/watch?v=HdHAB0hgIjw)
- [Mobile Demo](https://youtube.com/shorts/cy3Gg28Oh8E)

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15.2 (App Router, Turbopack) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion 11 |
| **Drag & Drop** | @atlaskit/pragmatic-drag-and-drop |
| **UI Components** | Headless UI 2 |
| **Date Utilities** | date-fns 2.30 |
| **Touch Gestures** | react-swipeable 7 |

## Project Structure

```
kanban-calendar/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Calendar.tsx        # Main calendar container
│   │   ├── DayColumn.tsx       # Individual day column
│   │   ├── DraggableEvent.tsx  # Event card with drag support
│   │   ├── EventModal.tsx      # Event detail modal
│   │   ├── CalendarHeader.tsx  # Navigation header
│   │   └── WeekHeader.tsx      # Mobile week day selector
│   ├── hooks/
│   │   ├── useWindowSize.ts    # Responsive detection
│   │   └── useSwipe.ts         # Touch gesture handling
│   ├── data/
│   │   └── events.ts           # Sample event data
│   └── types.ts                # TypeScript interfaces
├── public/                     # Static assets
└── Configuration files
```

## Resume-ready points by variant

### `general`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `web-dev`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `aws`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `python`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `aws-web-dev`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `aws-python`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `web-dev-django`
- **Built a planning app** with a **7-day desktop view** and automatic mobile switch at **<768px**, so users got the right layout for their device without manual toggles.
- **Added swipe controls** (**50px threshold**) and **keyboard shortcuts**, giving both mobile and desktop users faster ways to move through dense schedules.
- **Improved drag-and-drop interactions** and **reduced task-move friction**, especially during rapid replanning sessions with many event changes.
- **Kept scheduling logic reliable** during UI changes and **prevented planning regressions**, so day-to-day workflows remained stable.
- **Focused on clear transitions** and **context-preserving interactions**, helping users understand what changed after each action and where to continue next.

### `it-support`
- **Built a calendar app for desktop and mobile** with a **7-day desktop view**, helping users manage packed weekly schedules more confidently.
- **Added swipe gestures** (**50px threshold**) and **keyboard controls**, so users could move through plans quickly without extra clicks.
- **Improved drag-and-drop behavior** and **reduced accidental mistakes**, making task reorganization easier during busy planning windows.
- **Designed transitions that explain each change** and **kept users oriented**, even during frequent edits.
- **Kept behavior consistent across devices** and **reduced support questions**, making onboarding for new users easier.

### `it-support-aws`
- **Built a calendar app for desktop and mobile** with a **7-day desktop view**, helping users manage packed weekly schedules more confidently.
- **Added swipe gestures** (**50px threshold**) and **keyboard controls**, so users could move through plans quickly without extra clicks.
- **Improved drag-and-drop behavior** and **reduced accidental mistakes**, making task reorganization easier during busy planning windows.
- **Designed transitions that explain each change** and **kept users oriented**, even during frequent edits.
- **Kept behavior consistent across devices** and **reduced support questions**, making onboarding for new users easier.

### `sales`
- **Built a calendar app for desktop and mobile** with a **7-day desktop view**, helping users manage packed weekly schedules more confidently.
- **Added swipe gestures** (**50px threshold**) and **keyboard controls**, so users could move through plans quickly without extra clicks.
- **Improved drag-and-drop behavior** and **reduced accidental mistakes**, making task reorganization easier during busy planning windows.
- **Designed transitions that explain each change** and **kept users oriented**, even during frequent edits.
- **Kept behavior consistent across devices** and **reduced support questions**, making onboarding for new users easier.

### `call-centre`
- **Built a calendar app for desktop and mobile** with a **7-day desktop view**, helping users manage packed weekly schedules more confidently.
- **Added swipe gestures** (**50px threshold**) and **keyboard controls**, so users could move through plans quickly without extra clicks.
- **Improved drag-and-drop behavior** and **reduced accidental mistakes**, making task reorganization easier during busy planning windows.
- **Designed transitions that explain each change** and **kept users oriented**, even during frequent edits.
- **Kept behavior consistent across devices** and **reduced support questions**, making onboarding for new users easier.

## Installation

```bash
# Clone repository
git clone git@github.com:Kevin-Mok/kanban-calendar.git
cd kanban-calendar

# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Open http://localhost:3000
```

## Available Scripts

```bash
npm run dev        # Development server with Turbopack
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

## Why This Project is Interesting

### Technical Highlights

1. **Modern React Patterns**
   - Next.js 15 App Router with React 19
   - Custom hooks for responsive design and gestures
   - Client-side components with proper hydration

2. **Advanced Animation System**
   - Framer Motion shared layout animations
   - Smooth drag-and-drop with visual feedback
   - Coordinated transitions across multiple elements

3. **Cross-Platform UX**
   - Distinct mobile and desktop experiences
   - Touch-first gestures with mouse fallbacks
   - Accessible keyboard navigation

4. **Performance Optimization**
   - Turbopack for fast development builds
   - Component-level code splitting
   - Efficient re-renders with proper state management

### Skills Demonstrated

- **React Development**: Hooks, context, component composition
- **TypeScript**: Strict typing, interfaces, generics
- **Animation**: Framer Motion, CSS transitions, gesture handling
- **Responsive Design**: Breakpoints, touch vs mouse, layout adaptation
- **Modern Tooling**: Next.js 15, Tailwind 4, Turbopack

## Author

[Kevin Mok](https://github.com/Kevin-Mok)
