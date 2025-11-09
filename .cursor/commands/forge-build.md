<!-- forge-hash: 77e6863d672e5ea1b2deec479b63610ab5aefd206e31e74bf9eba9044ab516a6 -->

# Forge Build

This command helps you implement a Forge story by analyzing both the codebase and AI documentation.

## Prerequisites

You must provide a story file (*.story.md) when running this command.

## What This Command Does

1. **Calls MCP Tools**: Uses `get_forge_about` to understand the Forge workflow and story structure
2. **Reads the story file**: Understands what needs to be implemented
3. **Analyzes the existing codebase**: Understands current implementation patterns and structure
4. **Reads AI documentation**: Understands intended behavior from linked files:
   - Features (expected behavior with Gherkin scenarios)
   - Specs (technical implementation details with Nomnoml diagrams)
   - Models (data structures)
   - Contexts (technology-specific guidance)
5. **Implements the changes**: Writes actual code as described in the story
6. **Writes tests**: Creates unit tests for the implementation
7. **Ensures consistency**: Implementation matches the documented design

## Important Guidelines

- **Follow the story**: Implement exactly what the story describes (< 30 minutes of work)
- **Use AI documentation as reference**: Features and specs define the intended behavior
- **Match existing patterns**: Follow the codebase's existing architecture and conventions
- **Write tests**: Include unit tests as specified in the story
- **Stay focused**: If the story is too large, break it into smaller stories

## Usage

1. Select a story file from ai/tickets/
2. Run this command
3. The AI will call `get_forge_about` MCP tool
4. The AI will analyze the story and linked documentation
5. The AI will implement the changes with tests
6. Review and commit the implementation

The implementation will be consistent with your documented design and existing codebase patterns.