---
title: "Creating Skills"
summary: "Build and test custom workspace skills with SKILL.md"
read_when:
  - You are creating a new custom skill in your workspace
  - You need a quick starter workflow for SKILL.md-based skills
---

# Creating Custom Skills 🛠

OpenClaw is designed to be easily extensible. "Skills" are the primary way to add new capabilities to your assistant.

## What is a Skill?

A skill is a directory containing a `SKILL.md` file (which provides instructions and tool definitions to the LLM) and optionally some scripts or resources.

## Step-by-Step: Your First Skill

### 1. Create the Directory

Skills live in your workspace, usually `~/.openclaw/workspace/skills/`. Create a new folder for your skill:

```bash
mkdir -p ~/.openclaw/workspace/skills/hello-world
```

### 2. Define the `SKILL.md`

Create a `SKILL.md` file in that directory. This file uses YAML frontmatter for metadata and Markdown for instructions.

```markdown
---
name: hello_world
description: A simple skill that says hello.
---

# Hello World Skill

When the user asks for a greeting, use the `echo` tool to say "Hello from your custom skill!".
```

### 3. Add Tools (Optional)

You can define custom tools in the frontmatter or instruct the agent to use existing system tools (like `bash` or `browser`).

### 4. Refresh OpenClaw

Ask your agent to "refresh skills" or restart the gateway. OpenClaw will discover the new directory and index the `SKILL.md`.

## Advanced Features

Once the hello-world flow works, these are the next features most skill authors need:

- **Conditional activation**: gate skills on binaries, env vars, config flags, or OS support with `metadata.openclaw.requires` and related fields. See [Skills gating](/tools/skills#gating-load-time-filters).
- **Secrets and env injection**: wire API keys and other env values through `skills.entries.<name>.apiKey` and `skills.entries.<name>.env` instead of hardcoding them in `SKILL.md`. See [Skills](/tools/skills), especially the config overrides and environment injection sections.
- **Command dispatch**: expose a skill as a slash command with `command-dispatch`, `command-tool`, and `command-arg-mode` when you want direct tool routing instead of model reasoning. See [Skills](/tools/skills) for the supported frontmatter fields.
- **Portable paths**: use `{baseDir}` in instructions so scripts and resources resolve from the skill folder on any machine. See [Skills](/tools/skills) for format details.
- **Invocation control**: use `user-invocable` and `disable-model-invocation` to control whether a skill appears as a slash command, in the model prompt, or both. See [Skills](/tools/skills) for the frontmatter reference.
- **Testing strategies**: test the happy path, missing dependency path, and missing-secret path, then start a fresh session to confirm the updated snapshot is picked up. For broader workflows, see [Testing](/help/testing).
- **Frontmatter reference**: for the full supported frontmatter surface, use [Skills](/tools/skills) as the canonical reference.

## Best Practices

- **Be Concise**: Instruct the model on _what_ to do, not how to be an AI.
- **Safety First**: If your skill uses `bash`, ensure the prompts don't allow arbitrary command injection from untrusted user input.
- **Test Locally**: Use `openclaw agent --message "use my new skill"` to test.

## Shared Skills

You can also browse and contribute skills to [ClawHub](https://clawhub.com).
