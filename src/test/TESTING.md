# Testing Documentation

## Test Structure

This project uses a unit testing approach with Mocha as the test runner. Tests are organized to match the source structure.

### Current Test Coverage

#### Unit Tests (Pure Logic)
These tests run in a Node.js environment without requiring VS Code:

- **GlobalState Tests** (`state/GlobalState.test.ts`)
  - Singleton pattern initialization
  - State persistence and retrieval
  - Welcome screen dismissal logic scenarios
  - Cross-restart state persistence

- **KubeconfigParser Tests** (`kubernetes/KubeconfigParser.test.ts`)
  - Kubeconfig file parsing
  - Error handling
  - Multi-context support

### Dismiss Logic Test Coverage

The welcome screen dismiss functionality is thoroughly tested in `GlobalState.test.ts`:

1. **Permanent Dismissal** - Tests that checking "do not show again" persists across VS Code restarts
2. **Temporary Dismissal** - Tests that unchecking the box allows the welcome screen to reappear
3. **State Persistence** - Tests that state is correctly saved and retrieved from VS Code's storage
4. **Multiple Restarts** - Tests that dismissal state remains consistent across multiple activation/deactivation cycles

### Integration Tests (VS Code Environment)

Integration tests that require the VS Code extension host would test:
- Webview panel creation and lifecycle
- Message passing between webview and extension
- UI interactions and event handling
- Full activation/deactivation workflows

**Note**: Integration tests are not currently set up in this project. The VS Code Extension Test Runner (`@vscode/test-electron`) would be required to run these tests.

### Running Tests

```bash
# Run all unit tests
npm test

# Run only compilation and linting
npm run pretest

# Run tests in watch mode (requires setup)
npm run watch
```

### Manual Testing Checklist

For features that require the VS Code environment, manual testing should verify:

#### Welcome Screen Dismiss Logic
- [ ] Welcome screen appears on first extension activation
- [ ] Clicking "Get Started" without checkbox closes the screen temporarily
- [ ] Welcome screen reappears on next VS Code restart (after temporary dismiss)
- [ ] Checking "Do not show this again" and clicking "Get Started" dismisses permanently
- [ ] Welcome screen does NOT appear on subsequent VS Code restarts (after permanent dismiss)
- [ ] State persists correctly across VS Code updates and workspace changes

## Test Writing Guidelines

### Unit Tests
- Test pure business logic
- Mock external dependencies (file system, VS Code APIs)
- Use fixtures for test data
- Follow Mocha TDD style (`suite`, `test`, `setup`, `teardown`)

### Mocking VS Code APIs
The `test/mocks/vscode.ts` file provides mock implementations of VS Code APIs for unit testing. Only mock what's needed for the test.

### Test Organization
- Group related tests in suites
- Use descriptive test names that explain what is being tested
- Include both positive and negative test cases
- Test edge cases and error conditions

