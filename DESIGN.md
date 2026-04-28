# Agentic Coding Prompt — Guilty Bingo Youth UI (React + Inertia + shadcn/ui + Tailwind)

Build a modern, playful, mobile-first UI for a web app called **Guilty Bingo**.  
Audience: Youth participants in a Data Privacy & Cybersecurity seminar.

## Core Goal
The UI must feel like a fun game show / cyber arcade, not a boring school system.

---

# Tech Requirements
- React
- Inertia.js
- Tailwind CSS
- shadcn/ui
- Clean reusable components
- Accessible UI
- Responsive mobile-first design
- Smooth transitions / subtle animations
- Production-ready code

---

# Visual Direction
Design inspiration:
- Neon cyber arcade
- Bright gradients
- Soft glassmorphism cards
- Large rounded buttons
- Fun but clean layout
- High contrast text
- Energetic youthful vibe

## Color Feel
Use a vibrant palette:
- Purple
- Blue
- Cyan
- Pink accents
- Dark background option

## Typography
- Bold headings
- Friendly readable text
- Clear hierarchy

---

# Pages to Build

# 1. Join Page
First screen before entering game.

## Features
- App logo / title: Guilty Bingo
- Short subtitle:
  “Check your cyber habits and compete with friends.”
- Name input
- Avatar picker (emoji or icon grid)
- Join button
- Card centered vertically
- Animated background shapes or glow

## UX
- Big touch-friendly inputs
- Instant validation
- Button disabled until valid

---

# 2. Game Page
Main 5x5 bingo board.

## Layout
Top bar:
- Avatar
- Player name
- Countdown timer
- Current status badge

Main content:
- Responsive 5x5 grid
- Square tiles
- Equal height cards
- Easy tap interaction

Bottom:
- Submit button (sticky on mobile)

## Tile Behavior
Default:
- Neutral card

Selected:
- Bright glow border
- Slight scale animation
- Check icon overlay

Hover:
- Lift effect

## Timer
Large visible countdown with urgency color change.

---

# 3. Result Modal / Result Page

After submit show:

- Total Guilty Count
- Rank (if available)
- Badge title:
  - Privacy Pro
  - Needs Update
  - Risk Taker
- Short improvement tips
- View Leaderboard button

Use celebratory animation.

---

# 4. Leaderboard Page

## Layout
Top hero section:
- Trophy icon
- Live Leaderboard

## Show
- Rank
- Avatar
- Name
- Guilty Count
- Submission Time
- Badge

## Styling
Top 3 users displayed as podium cards.
Others in stylish table/list cards.

Realtime updates supported visually.

---

# 5. Admin Dashboard

## Sections
- Stats cards
- Create Bingo Card
- Edit 5x5 grid
- Activate Card
- Timer Settings
- Participant Count
- Live Leaderboard Preview

## Card Editor
5x5 editable matrix UI:
Each cell has:
- label
- severity
- icon

Use modal or side panel editing.

---

# Components to Create

## Shared Components
- AppShell
- GradientBackground
- NeonCard
- CountdownTimer
- AvatarPicker
- BingoTile
- LeaderboardTable
- PodiumCard
- ResultBadge
- EmptyState
- LoadingScreen

---

# Motion / Interaction
Use subtle animations:
- Fade in
- Scale on select
- Hover lift
- Confetti on result
- Pulse timer when near zero

Avoid overdoing animation.

---

# Mobile UX Rules
- Sticky submit button
- Large tap targets
- Compact top bar
- Scroll friendly
- Fast rendering

---

# Accessibility
- Keyboard navigation
- Proper focus states
- ARIA labels
- Color contrast safe

---

# Code Quality
- Reusable components
- Clear folder structure
- Props typed if using TS
- No duplicated UI logic
- Maintainable code

---

# Important Feel
When users open it, they should say:
“Wow, this looks fun.”

Not:
“This looks like a government form.”

Generate the full UI implementation with clean structure and best practices.