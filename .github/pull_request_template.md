## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark relevant items with an "x" -->

- [ ] New example
- [ ] Bug fix in existing example
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Dependency update

## Related Issues

<!-- Link to related issues using #issue_number -->

Fixes #
Related to #

## Changes Made

<!-- List the main changes made in this PR -->

- Change 1
- Change 2
- Change 3

## New Example Details

<!-- If adding a new example, fill this section -->

- **Example name**:
- **Framework**: [e.g., vanilla TypeScript, React, Vue]
- **WebMCP concepts demonstrated**:
- **Tools registered**:
- **Dependencies added**:

## Testing

<!-- Describe how you tested these changes -->

### Commands Run

```bash
cd [example-directory]
pnpm install     # ✓ Installed successfully
pnpm typecheck   # ✓ Passed
pnpm lint        # ✓ Passed
pnpm build       # ✓ Passed
pnpm dev         # ✓ Runs without errors
```

### Manual Testing with MCP-B Extension

- [ ] Extension detects the page
- [ ] All registered tools appear in extension
- [ ] Each tool executes successfully
- [ ] UI updates correctly after tool execution
- [ ] Error cases handled gracefully
- [ ] Tested in Chrome/Edge
- [ ] Tested on mobile (if applicable)

### Screenshot/Demo

<!-- If applicable, add screenshots or GIF showing the example working -->

## Checklist

<!-- Mark completed items with an "x" -->

- [ ] My code follows the style guidelines in [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I have used the modern WebMCP API (`@mcp-b/global` or `@mcp-b/react-webmcp`)
- [ ] I have NOT used deprecated APIs from `/relegated`
- [ ] I have performed a self-review of my own code
- [ ] I have added JSDoc comments to all exported functions/components
- [ ] I have created/updated README.md for the example
- [ ] My changes generate no TypeScript errors
- [ ] I have tested with the MCP-B Chrome Extension
- [ ] All tools register and execute successfully
- [ ] Example runs without console errors

## Documentation

<!-- If adding/modifying an example -->

- [ ] README.md includes clear description of what the example demonstrates
- [ ] README.md has installation and usage instructions
- [ ] README.md explains WebMCP concepts used
- [ ] Code has explanatory comments for WebMCP-specific code
- [ ] Dependencies are documented in package.json

## Additional Notes

<!-- Any additional information that reviewers should know -->

---

**For AI Agents**: Please verify all items in the checklist before submitting. Run all commands listed in the Testing section.
