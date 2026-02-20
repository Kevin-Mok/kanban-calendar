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
- Built a responsive calendar-kanban app with draggable events and smooth card-to-detail transitions across both desktop and mobile contexts.
- Solved cross-device interaction complexity with swipe navigation, animated headers, and performance-conscious layout behavior.

### `web-dev`
- Implemented Next.js, TypeScript, and Tailwind UI patterns for drag-and-drop scheduling and dynamic day and week navigation.
- Built mobile infinite horizontal scrolling plus desktop week controls, delivering consistent behavior across different interaction models.

### `aws`
- Structured frontend architecture for clean deployment and predictable runtime behavior, supporting cloud-hosted delivery and reliability.
- Applied performance and state-management discipline that translates well to cloud-monitored web applications.

### `python`
- Designed interaction flows and data contracts that transfer directly to Python-backed scheduling APIs and state services.
- Built maintainable component boundaries that align with Python web teams integrating business logic behind modern frontends.

### `aws-web-dev`
- Combined polished frontend delivery with deployment-conscious architecture decisions suited for cloud-hosted product environments.
- Balanced UX richness with operational simplicity, enabling reliable releases for interaction-heavy calendar workflows.

### `aws-python`
- Created UI and data boundaries that map cleanly to Python services running in cloud-managed scheduling platforms.
- Prioritized deterministic interaction state to support backend automation and infrastructure-aware feature evolution.

### `web-dev-django`
- Implemented scheduling and form-like interaction patterns that pair naturally with Django models and calendar domain logic.
- Built reusable frontend modules that integrate cleanly with Django APIs for production calendar applications.

### `it-support`
- Reduced usability confusion through clear transitions, navigation cues, and responsive behavior tailored to different device contexts.
- Built predictable interaction patterns that make issue reproduction and support troubleshooting substantially easier.

### `it-support-aws`
- Designed stable runtime behavior and clear state transitions that simplify support triage in hosted environments.
- Structured feature flows so support teams can quickly isolate UI regressions from deployment-side issues.

### `sales`
- Delivered a visually strong productivity product with clear value demonstration, improving conversion potential in demos and portfolios.
- Combined interaction polish and practical scheduling utility to support persuasive client-facing product conversations.

### `call-centre`
- Built intuitive navigation and feedback loops that reduce repetitive clarification during high-volume user questions.
- Emphasized clear interaction outcomes to improve communication consistency across support handoffs.

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
