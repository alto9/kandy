<!-- forge-hash: 9c9f44260b492a892af5d460add73675c56f3d25451d3af4a1dfdcea7f61ca6f -->

# Forge Design

This command guides AI agents when working within Forge design sessions to update documentation.

## Prerequisites

You must have an active design session before making changes to AI documentation.

## What This Command Does

1. **Calls MCP Tools**: Uses `get_forge_about` to understand the Forge workflow and session-driven approach
2. **Checks for active session**: Ensures you're working within a structured design workflow
3. **Reads AI documentation**: Understands existing design patterns and structure
4. **Guides documentation updates**: Helps create or modify features, specs, models, actors, and contexts
5. **Tracks all changes**: Ensures changed files are tracked in the active session's `changed_files` array

## Important Constraints

- **This is a Forge design session**: You are working within a structured design workflow
- **Only modify AI documentation files**: Work exclusively within the `ai/` folder
- **Do NOT modify implementation code**: This command is for updating features, specs, models, actors, and contexts only
- **Track all changes**: Ensure changed files are tracked in the active session's `changed_files` array
- **Use proper formats**: Features use Gherkin in code blocks, Specs use Nomnoml diagrams
- **Call MCP tools**: Always start by calling `get_forge_about` to understand the current Forge workflow

## Usage

1. Ensure you have an active design session
2. Run this command
3. The AI will call `get_forge_about` MCP tool
4. The AI will analyze existing AI documentation
5. The AI will update documentation in the ai/ folder
6. All changes will be tracked in the active design session

The documentation updates will be consistent with your existing design patterns and the Forge workflow.