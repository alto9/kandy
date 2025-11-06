---
story_id: add-workloads-css-styling
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [webview-spec]
model_id: []
status: completed
priority: medium
estimated_minutes: 25
---

## Objective

Add comprehensive CSS styling for the workloads section including pill selectors, table layout, health indicators, and empty state following the exact styles defined in webview-spec.

## Context

The webview-spec includes detailed CSS for the workloads section. This styling ensures the UI matches VS Code's design language using CSS variables, provides clear visual states for pill selectors, and displays health indicators with appropriate colors.

## Implementation Steps

1. Open `src/webview/namespace.html`
2. Locate the `<style>` tag in the head section
3. Add workloads section CSS after existing styles:
   - `.workloads-section` - padding: 20px
   - `.workloads-section h2` - margin, font-size, font-weight, color
4. Add pill selector styles:
   - `.workload-type-pills` - flexbox layout with gap and wrap
   - `.pill-selector` - padding, border, background, color, border-radius, cursor, transitions
   - `.pill-selector:hover:not(.active)` - hover state with background and border color changes
   - `.pill-selector.active` - active state with button background/foreground colors and font-weight: 600
   - `.pill-selector:focus` - focus outline for accessibility
5. Add workloads table styles:
   - `.workloads-table` - full width, border-collapse, background, border, border-radius
   - `.workloads-table thead` - header background and bottom border
   - `.workloads-table th` - padding, text-align, font-weight, text-transform, letter-spacing
   - `.workloads-table td` - padding, border-bottom, font-size
   - `.workload-row` - cursor: default (non-clickable)
   - `.workload-row:hover` - hover background color
6. Add health indicator styles:
   - `.health-indicator` - font-size, margin for colored dot
   - `.health-indicator.healthy` - green (--vscode-testing-iconPassed)
   - `.health-indicator.degraded` - yellow/orange (--vscode-editorWarning-foreground)
   - `.health-indicator.unhealthy` - red (--vscode-testing-iconFailed)
   - `.health-indicator.unknown` - gray (--vscode-descriptionForeground)
   - `.workload-health` - flexbox for indicator + text alignment
7. Add table note style:
   - `.table-note` - margin-top, font-size, color, font-style: italic
8. Ensure all colors use VS Code CSS variables for theme compatibility

## Files Affected

- `src/webview/namespace.html` - Add CSS rules to existing style tag

## Acceptance Criteria

- [ ] Workloads section has proper spacing and layout
- [ ] Pill selectors display in horizontal flexbox with gaps
- [ ] Pill selectors have distinct active and inactive states
- [ ] Pill selector hover effects work on inactive pills only
- [ ] Active pill has button background color and font-weight 600
- [ ] Focus outlines are visible for keyboard navigation
- [ ] Table has proper border, spacing, and header styling
- [ ] Table headers are uppercase with letter-spacing
- [ ] Table rows have hover effect with cursor: default
- [ ] Health indicators display with correct colors: green/yellow/red/gray
- [ ] Health indicator dots and text are properly aligned
- [ ] Table note displays as italic with subtle color
- [ ] All colors use VS Code CSS variables (--vscode-*)
- [ ] Styles are consistent with existing webview styling

## Dependencies

- Story 05 (update-namespace-html-structure) - Requires HTML elements to exist

