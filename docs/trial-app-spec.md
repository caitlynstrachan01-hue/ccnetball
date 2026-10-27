# Trial App — product spec (source of truth for the build)

A self-serve app, inside ccnetball.com, that clubs/associations use to run netball
trials: registration + payment, de-identified game line-ups, team selection, and
export/print. CC Netball charges **$2.20 per participant**.

## Accounts & structure
- **Open, self-serve** — any **club OR association** signs up and runs their own
  trials. **No approval** needed and **no limit** on how many run at the same time.
  (For clubs & their club teams, and associations & their rep teams / divisions.)
- They log in using the site's existing login system (Supabase auth).
- They create a **trial** and add **divisions** (age groups) over time — e.g. U14
  now, U16 later — against the same login.
- **Each division is self-contained** and has **its own finances** (fees + reporting).

## Money flow & payouts (Stripe Connect)
- **The platform (CC Netball) collects all participant payments** through Stripe.
- CC Netball keeps the **$2.20 per participant**.
- Any **add-on fees** the club chose to pass on (umpires, selector, court hire, other)
  are collected by the platform and **deposited back to the club/association at the
  END of the trials** — only if they opted to collect those fees.
- At **sign-up / setup**, the club connects a **payout method** (their bank, via
  Stripe Connect) so the platform can deposit their share.
- If a club chooses to **cover the $2.20** itself (per division), it's invoiced for
  that at the end instead of charging participants.

## 1. Club setup screen
- Club/association details, contact email (for invoice).
- **Selection-sheet template:** the club picks one of **3 print formats** (see
  "Selection sheet templates" below) for how populated game line-ups print for selectors.
- Per division, the club configures the **payment breakdown** (see Fees).
- Sessions: each division has one or more sessions, each with **date, time, venue**.

## 2. Player registration link
- Each trial has a **shareable registration link**; players register for a **specific
  division (age group)**.
- Registration collects: name, DOB, **two preferred playing positions**, playing history,
  medical/injury, parent/guardian, emergency contact.
- Player pays at registration (see Fees). Card surcharge passed on, never absorbed.
- **Manual add:** the club can also add a player's details by hand. A manually-added
  player sits **outside the online payment** — no card is taken from them. The **$2.20 is
  billed back to the club/association** (added to their invoice). It's **the club's
  responsibility to follow up and collect** that $2.20 from the player. Likewise, if the
  division has **extra fees** (umpires, selector, court hire, other), collecting those from
  a manually-added player is **also the club's job** — the platform does not chase them.

## Fees (per division)
- Base: **$2.20 per participant** (CC Netball's fee).
- The club decides, **per division**, whether to also pass on **extra fees per applicant**
  — umpiring, independent selector, court hire, other (any amount).
- The club decides whether participants pay the $2.20 at registration, or the **club
  covers it and is invoiced** at the end (per division).
- Finances are reported **per division**.

## 2b. Attendance / check-in (on the day)
- Each session has an **attendance list** of the players registered for that division.
- As players **arrive, they are checked off** (marked present).
- **Only checked-in players populate** the team-building and games screens — a player who
  is **not** in attendance does **not** appear in team-list creation or the court line-ups.
- Attendance is tracked **per session** (feeds court-time tracking).
- **Editable mid-trial / late arrivals:** the selector can check a player in **partway
  through** the trial. When they do, they can **adjust the schedule from a chosen round
  onward** to include that player, and the games **repopulate from that round forward** to
  fold them in. **Earlier rounds are left unchanged** (not retro-rewritten). The
  both-preferred-positions goal is then pursued over the rounds the late player is present
  for.

## 3. Team building (selection)
- Ask **how many teams** the club wants to build (per division).
- **Whole player list on the right**; drag/transfer players across into the teams so
  **nobody is left out**.
- **Each team has three sub-headings — Shooters · Midcourt · Defenders.** Players are
  dragged **under a sub-heading** so the selector can see the **balance** of each team at
  a glance (enough shooters / midcourt / defenders). (Grouping guide: Shooters = GS, GA;
  Midcourt = WA, C, WD; Defenders = GD, GK — but placement is **manual**, the selector
  decides which bucket a player goes in.)
- **In the team-building view ONLY**, each player chip shows their id (number **or**
  first initial + surname, per display mode) **plus their two nominated positions** —
  e.g. `A. Smith WA/GA` or `#2 WA/GA`. The positions are a **placement aid for the
  selector** here.
- **On the trial document (printed/shared), positions are NOT shown** — players appear as
  just `A. Smith` or `#2`. Positions live only on the team-building screen.
- Populated teams **export/print in the same layout** shown on screen (without the
  position labels).

## 4. Trial games (de-identified line-ups)
- Players are placed **by number** (de-identified).
- Goal: **every player plays BOTH of their two preferred positions across the trial** so
  they're properly assessed (evaluated **across all sessions**, not just one).
- If there aren't enough court slots to get everyone on / into both positions, the app
  should **recommend half-games** (two players share a slot, ½ each).
- **Manual adjustment:** selectors can manually move a player into a position (override)
  — e.g. to see certain players more.

## 5. Court-time tracking
- A page that tracks **court time per participant across all sessions** of the trial —
  how many times each player has played, and whether they've hit both preferred positions.
- Feeds the manual-adjustment decisions.

## 6. Export / print
- Every screen exports to CSV and prints for the club (player list, attendance, games,
  teams, finance). Team sheets + blank selection sheets as in the prototype.

## Selection sheet templates (print formats — club picks one)
Originals: `docs/templates/CC_Netball_Selection_Sheet{,_2,_3}.pdf`.
All share a header: **Age group · Selectors · Date · Time · Game #**, with **Team A**
(positions GS→GK) and **Team B** (GK→GS). The app fills each position cell with the
player (number, or first initial + surname, per display mode); stat cells stay blank for
selectors to complete by hand on the day.
1. **Line-up only** — two games per page; just the position line-ups.
2. **Line-up + shooting stats** — one game; a "Shooting stats" area beside GS and GA.
3. **Full stats grid** — one game; per-position columns:
   Shooting · Contact · Obstruction · Negative · Error · Positive · Turnover · Intercept ·
   Other Comments.

## Display mode (club's choice)
- The club chooses how players appear on trial documents (game sheets, team lists,
  court-time, exports/prints): either **de-identified by player number**, or
  **first initial + surname** (e.g. "A. Smith"). Defaults to player-number (most private).

## Privacy / retention
- Personal + medical data deleted **3 months** after a division's last session; a
  de-identified finance/summary record is kept.

## Build order
1. Club setup + divisions + per-division fees  →  registration link  →  registration +
   **Stripe payment** (the money path).  ← Phase 1 core
2. Team building (draft), games (with both-preferred-positions + half-game recommend),
   court-time tracking, manual adjustment  ← port from the working prototype.
3. Selection-sheet print templates (×3), club dashboard, export/print polish, invoicing.
