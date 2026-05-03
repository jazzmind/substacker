# Manage Knowledgement Substacker Pipeline

This document maps Manage Knowledgement onto the existing Substacker model without changing Substacker code.

## Stack Record

Use the following values when creating the publication in Substacker.

```json
{
  "name": "Manage Knowledgement",
  "substackUrl": "https://manageknowledgement.substack.com",
  "expertName": "Wes Sonnenreich",
  "expertBio": "AI strategy lead, builder, and practical modernist exploring how humans should handle abundant knowledge, AI agents, ignorance, wisdom, and shared values.",
  "topics": [
    "AI-native life",
    "knowledge and wisdom",
    "ignorance",
    "personal operating systems",
    "agent-mediated work",
    "family and collective knowing",
    "decision-making"
  ],
  "status": "onboarding",
  "postingFrequency": "weekly"
}
```

If the final Substack URL differs, update `substackUrl` before creating drafts or publishing.

## Expert Profile

Use the expert profile to preserve voice and thesis so Substacker agents do not genericize the publication.

```json
{
  "expertise": [
    "AI strategy",
    "agentic workflows",
    "knowledge work",
    "software systems",
    "organizational decision-making",
    "practical philosophy"
  ],
  "talkingPoints": [
    "Access to knowledge is not the same as readiness to carry it.",
    "Ignorance can be dangerous, useful, chosen, protective, or transitional.",
    "The right amount of knowing depends on the endeavor and the reversibility of the decision.",
    "Wisdom is knowledge metabolized through values, consequence, time, humility, and care.",
    "AI agents should sharpen human judgment rather than replace it.",
    "Shared values should govern shared knowledge.",
    "Families, teams, and institutions are knowledge systems."
  ],
  "tone": "Practical, modernist, reflective, direct, grounded, not academic, not guru-like.",
  "targetAudience": "Thoughtful builders, operators, creators, parents, managers, and professionals who use AI tools and want better judgment about how to seek, hold, share, and act on knowledge.",
  "uniqueAngle": "A reversal of knowledge management: instead of assuming collected knowledge creates shared value, Manage Knowledgement asks how shared values should govern the pursuit and use of knowledge.",
  "preferredFormats": [
    "long-form essay",
    "practical framework",
    "agent skill companion",
    "reflective exercise",
    "season arc"
  ],
  "interviewTranscript": "Seeded from the Manage Knowledgement publication profile and season plan."
}
```

## Strategy Record

Substacker's strategy record should be initialized with the following:

```json
{
  "postingSchedule": "Weekly foundation essays for Season 1; each post includes one practical artifact when the practice is repeatable.",
  "contentPillars": [
    "Ignorance as a Resource",
    "Knowledge as Force",
    "Wisdom as Metabolism",
    "The Right Amount of Knowing",
    "Shared Values Before Shared Knowledge"
  ],
  "growthTactics": [
    "Publish essays first for clarity, then package short excerpts for social channels.",
    "Invite reader replies around concrete dilemmas rather than broad agreement.",
    "Share companion skills as optional practice artifacts, not as prompt-pack giveaways.",
    "Use reader questions as future post seeds and knowledge-base entries.",
    "Avoid generic AI productivity positioning."
  ],
  "toneGuidelines": "Write with moral seriousness and practical usefulness. Avoid academic abstraction, guru language, hype, and easy certainty. Every essay should eventually answer: what should I do differently because I know this?"
}
```

## Content Lifecycle

### 1. Idea Capture

Source raw ideas from:

- personal reflections;
- AI-native coach conversations;
- reader replies;
- family, team, and work dilemmas;
- research notes;
- practical agent failures or successes.

Store raw notes in the `Manage Knowledgement` ai-native project before turning them into drafts.

### 2. Brief

Create a post brief using the Season 1 format:

- working claim;
- reader dilemma;
- practical center;
- AI-native angle;
- examples;
- companion artifact;
- advisor workflow.

The canonical briefs live in `content/manage-knowledgement/season-one-briefs.md`.

### 3. Research

Use Substacker's `substack-researcher` sparingly. Competitive research should answer:

- What adjacent newsletters or essays are addressing similar anxieties?
- Which terms are saturated?
- What angles feel generic?
- What vocabulary can Manage Knowledgement own?

Do not let competitor analysis determine the thesis.

### 4. Interview Or Reflection

Use Substacker's interview flow as a self-interview mechanism:

- generate 5-8 questions from the post brief;
- answer them in text or audio;
- preserve the transcript;
- extract lived examples and contradictions;
- generate a draft only after QA review.

The self-interview should make the author more precise, not merely create more raw material.

### 5. Draft

Use Substacker's content writer only after:

- the thesis is stable;
- the practical center is named;
- QA Judge has reviewed risky claims;
- the companion artifact candidate is known.

Draft output should remain in `review` status until the author has edited it.

### 6. Companion Artifact

Create the skill or exercise before publishing, then run it once personally.

Artifact statuses:

- `candidate` — idea named in the post brief;
- `drafted` — first skill/checklist exists;
- `tested` — author used it on a real decision or reflection;
- `published` — linked from the essay;
- `revised` — updated based on reader or personal use.

### 7. Publish

Use Substacker's draft/publish bridge only after the quality gates are met.

Default publishing rule:

- create Substack draft first;
- review manually in Substack;
- publish manually or through bridge only after final approval.

### 8. Analytics And Learning

Substacker analytics should track more than subscriber growth.

Suggested qualitative fields to capture in notes or analytics metadata:

- replies that contain better questions;
- examples readers contribute;
- confusion about the concept;
- requests for companion skills;
- evidence that a reader used a practice;
- places where promotion attracted the wrong audience.

## Publication Status Definitions

- `onboarding` — positioning, profile, and first artifacts are being created.
- `active` — publishing on cadence and tracking reader feedback.
- `paused` — intentionally not publishing while the author metabolizes or researches.
- `archived` — no longer active.

## Guardrails For Substacker Agents

Use these instructions in prompts or agent context:

- Preserve the distinction between knowledge management and Manage Knowledgement.
- Do not turn posts into generic AI productivity essays.
- Every post must include a practical center.
- Companion artifacts are optional and must be earned by repeatable practice.
- Promotion should invite thoughtful response, not maximize outrage or novelty.
- The author's lived examples and values outrank competitor patterns.
