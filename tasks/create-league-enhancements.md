# Create a League — Enhancements

## Goal

Improve the Create a League flow with additional fields and better post-creation routing.

## Tasks

### 1. Add fields to the Create a League step

In the Create a League form, add two new fields:

- **Start Date** — date picker or text input (e.g. `<input type="date">`) so the user can set when the league begins
- **Max Participants** — numeric input for the maximum number of players allowed in the league

Both fields should be saved to the league object in localStorage (or wherever league data is persisted).

### 2. Route to League Home after creation (not Draft)

After the user completes the Create a League flow, redirect them to **League Home** instead of the Draft screen.

### 3. Empty state on League Home post-creation

When arriving at League Home from a fresh league creation:

- Show a **"Draft Lineup" CTA** in an empty state (no pre-selected artists — lineup is blank until the user drafts)
- Do NOT pre-populate a lineup

### 4. Show Invite Code prominently on League Home

After creating a league, display the **Invite Code** visibly on the League Home screen so the creator can immediately share it with other members.

- It should be easy to see and copy without navigating away
