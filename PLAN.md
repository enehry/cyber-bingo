# Guilty Bingo Seminar App Plan

## Overview

A web-based interactive seminar game focused on Data Privacy and Cybersecurity. Users join instantly, receive a persistent guest identity, play on the currently active bingo card, submit within a time limit, and compete on a leaderboard where the lowest guilty score wins.

## Tech Stack

* Backend: Laravel
* Frontend: React + Inertia.js
* UI: shadcn/ui + Tailwind CSS
* Realtime: WebSockets (Laravel Reverb / Soketi / Pusher compatible)
* Database: MySQL or PostgreSQL
* Auth: Guest session + UUID
* Queue/Cache: Redis (recommended)

---

# Core Modules

## 1. Admin Backend

Admin dashboard for managing bingo events.

### Features

* Secure admin login
* Dashboard statistics
* Create bingo cards
* Edit bingo cards
* Duplicate previous cards
* Activate one bingo card only
* Set game timer
* Lock / unlock submissions
* Reset leaderboard
* Export results CSV
* Live participant monitor
* Realtime leaderboard screen mode

### Bingo Card Rules

* One active card at a time
* Card contains 5 x 5 = 25 cells
* Optional fixed center tile (Free Space)
* Each cell contains:

  * title
  * description (optional)
  * risk weight
  * display color/icon
  * active flag

---

## 2. User Experience Flow

### First Visit

User lands on homepage.

Required inputs:

* Display name
* Select avatar/icon

System actions:

* Generate UUID
* Save UUID in session/local storage
* Create guest player record
* Redirect to active game board

### Returning Visit

* Detect UUID
* Restore player session
* Rejoin current game if still open

---

## 3. Game Flow

1. User opens active bingo card
2. Countdown timer visible
3. User selects guilty habits from 5x5 grid
4. User submits before timer ends
5. Auto-submit on timeout
6. Score calculated on server
7. Leaderboard updates in realtime
8. Results explanation shown

---

# Data Model

## users_guests

* id
* uuid
* name
* avatar
* session_last_seen
* created_at

## bingo_cards

* id
* title
* description
* is_active
* time_limit_seconds
* starts_at
* ends_at
* created_by
* created_at

## bingo_card_cells

* id
* bingo_card_id
* row_index
* col_index
* label
* description
* risk_weight
* icon
* color

## submissions

* id
* bingo_card_id
* guest_id
* selected_cells_json
* guilty_count
* weighted_score
* submitted_at_seconds
* tie_break_score
* created_at

---

# Score Logic

Lowest score wins.

## Base Score

* guilty_count = number of selected cells
* Fewer selected = better rank

## Weighted Score

Each tile can have severity weight:

* minor risk = 1
* medium risk = 2
  n- major risk = 3

weighted_score = sum(selected tile weights)

## Tie Breakers (recommended ranking order)

1. Lowest guilty_count
2. Lowest weighted_score
3. Fastest submission time
4. Random fun badge tie-break token assigned at join

This avoids ties while keeping fairness.

## Example

Player A: 3 guilty / weight 5 / 28s
Player B: 3 guilty / weight 6 / 20s
Winner: Player A

---

# Realtime Features

Use WebSockets for:

* Live leaderboard updates
* Countdown sync
* Game started / ended state
* New participants joined
* Admin activate card instantly updates users
* Celebration effects for winners

---

# UI / UX Direction (Youth Friendly)

Theme: playful cyber arcade.

## Visual Style

* Bright gradients
* Neon glow cards
* Rounded large buttons
* Emoji / icons
* Smooth animations
* Confetti success states
* Mobile-first layout

## User Screen Ideas

* Big countdown timer
* Tap-friendly grid cells
* Animated selected states
* Avatar badge header
* Result card with rating:

  * Privacy Pro
    n  - Needs Update
  * Risk Taker

## Leaderboard Design

Columns:

* Rank
* Avatar
* Name
* Guilty Count
* Time
* Badge

Highlight top 3 with podium cards.

---

# Suggested Improvements

## 1. Randomized Cell Positions

Same content, shuffled positions per user to reduce copying.

## 2. Learning Feedback

After submit, show tips for selected risky habits.

## 3. Anti-Cheat

* One submission per UUID
* Server-side scoring only
* Signed requests / CSRF
* Rate limit join requests
* Detect duplicate names (optional)

## 4. Session Recovery

If refresh occurs, restore current state.

## 5. Projector Mode

Fullscreen leaderboard for seminar screen.

## 6. Sound Effects

Optional click / win sounds.

---

# Laravel Architecture Suggestion

## Backend Areas

* app/Actions
* app/Http/Controllers/Admin
* app/Http/Controllers/Game
* app/Events
* app/Models
* app/Policies
* app/Services

## Frontend Areas

* resources/js/pages/admin/*
* resources/js/pages/game/*
* resources/js/components/*
* resources/js/layouts/*

---

# Main Routes

## Public

* GET /
* POST /join
* GET /play
* POST /submit
* GET /leaderboard

## Admin

* GET /admin
* GET /admin/cards
* POST /admin/cards
* PUT /admin/cards/{id}
* POST /admin/cards/{id}/activate
* POST /admin/game/reset
* GET /admin/results/export

---

# Build Phases

## Phase 1 MVP

* Guest join
* Active card display
* Submit answers
* Leaderboard
* Admin create/edit/activate card

## Phase 2 Polish

* WebSockets realtime
* Better animations
* Podium leaderboard
* Feedback tips
* Projector mode

## Phase 3 Advanced

* Multi-event history
* Analytics dashboard
* Certificates
* QR join analytics

---

# Final Recommendation

Keep gameplay simple, fast, and fun. The seminar should feel like a game show, not a school exam.
