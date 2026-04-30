---
name: task-spec-builder
description: >
  Turns a rough idea or thought into a fully-formed, ready-to-execute backlog task spec
  for Ross's Music Discovery Platform. Trigger this skill whenever Ross mentions wanting
  to capture an idea, log a task, add something to the backlog, write up a feature, or
  says things like "I want to track this", "let's spec this out", "add this to the
  backlog", "make a task for", or "I keep thinking about X". Even if the idea is half-formed
  or vague, use this skill to help turn it into a concrete task. Do not wait for explicit
  phrasing — if it sounds like a task that needs to be captured, trigger this skill.
---

# Task Spec Builder

Conducts a focused interview to turn a rough idea into a fully-formed backlog task for
the Music Discovery Platform. The output is a clean markdown file ready to pick up and
execute.

---

## Project Context

This is a music discovery app with a fantasy sports-style mechanic. Key details to keep
in mind when writing or inferring task context:

- **Stack**: Vite + vanilla JS, Spotify Web API (PKCE auth), `localStorage` for state
- **Key files**: `src/auth.js`, `src/spotify.js`, `src/scoring.js`, `src/main.js`, `src/ui.js`, `src/style.css`
- **Current phase**: Single-player prototype (no backend)
- **Scoring**: Weekly Spotify `popularity` delta; individual `GET /v1/artists/{id}` fetches with backoff
- **Auth**: PKCE only, `user-top-read` scope, redirect URI `http://127.0.0.1:5173/callback`
- **Three-view UI**: login → draft → score

Use this context to make smart inferences rather than asking unnecessary questions.

---

## Task Spec Format

ALWAYS produce output using this exact template. Omit any optional section if it genuinely
doesn't apply — don't include empty or placeholder sections.

```
# task-name-in-kebab-case

## Goal
One tight paragraph: what gets built, what changes, what the user experiences differently.
No bullet points. Be specific about files, functions, and UI states where relevant.

## Context (optional)
Background on why this matters now, what it supersedes or depends on conceptually,
or any design decisions that informed this task. Include links to related task files
if known.

## Inputs (optional)
- `path/to/file.js` — what changes and why (one line per file)

## [Task-specific section name] (optional)
For formulas, logic rules, state machines, edge cases, or anything that needs
to be understood before coding. Name the section for what it contains, not generically.
Use this for anything too complex to live in Acceptance Criteria alone.

## Acceptance Criteria
- [ ] Specific, testable condition (observable behavior or verifiable output)
- [ ] Each item is independently checkable — no compound conditions
- [ ] Edge cases and empty states are covered
- [ ] UI text, labels, or messages are quoted literally where they matter

## Dependencies (optional)
- `[other-task.md](other-task.md)` — one-line note on what it provides

## Output (optional)
- Branch: `feat/task-name`
- Commit: `feat: short imperative description`

## Out of Scope (optional)
- Feature or behavior explicitly deferred (with a note on when/why)
```

---

## Interview Process

### Step 1 — Understand the idea

If Ross has stated a rough idea, restate it back in one sentence to confirm understanding
before asking anything. If the idea is truly a single sentence with no context, ask:

> "Before I spec this out — can you tell me a bit more about what you're imagining?
> What should a user (or the app) be able to do that they can't do right now?"

Don't ask this if the idea already contains enough to infer a Goal.

### Step 2 — Ask targeted clarifying questions

Ask only what you can't confidently infer. Keep it to **3 questions maximum** in a single
pass. Use the project context above to fill gaps without asking.

Prioritize questions in this order:
1. **Goal clarity** — What does done look like from the user's perspective?
2. **Acceptance Criteria** — What are the edge cases, empty states, or failure modes?
3. **Scope boundaries** — What is explicitly NOT part of this task?

Do NOT ask about:
- Files to touch (infer from the codebase structure)
- Branch or commit naming (derive from task name)
- Stack/auth/API details (already known from project context)

### Step 3 — Draft and present

Once you have enough to write a solid spec, produce the full task file. Don't ask
for permission — just write it and present it.

After presenting, ask one follow-up:
> "Does this capture it? Anything to add, cut, or sharpen?"

Make any edits inline. When it's locked:

1. Write the final spec to `tasks/[task-name].md`
2. Append a `[ ]` entry for it to the Backlog section of `tasks/QUEUE.md`, using the
   format: `- [ ] task-name.md   One-line description of what the task does`

---

## Quality Bar

A good task spec passes this test: **could a developer who has never seen this codebase
pick it up, understand what to build, and know when they're done?**

Acceptance Criteria checklist:
- [ ] Every criterion is independently verifiable (no "and" conditions)
- [ ] Edge cases and empty states are explicit
- [ ] UI copy is quoted literally where it matters
- [ ] The "done" state is unambiguous

Goal checklist:
- [ ] Names the specific UI view or function that changes
- [ ] Describes the before/after user experience or system behavior
- [ ] Doesn't bleed into implementation (no "we should refactor X")

---

## Task Naming

Task names are kebab-case, descriptive, and verb-noun when possible:

- `weekly-score-calculation` ✓
- `draft-view-artist-search` ✓
- `feature` ✗ (too vague)
- `fixBug` ✗ (wrong format)

Name the file `[task-name].md`.
