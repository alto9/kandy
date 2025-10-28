---
story_id: add-cluster-status-indicators
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: medium
estimated_minutes: 25
---

## Objective

Add visual status indicators to tree items showing cluster connection status and highlighting the current context.

## Context

Users need visual feedback about which clusters are available and which context is active. Status indicators (icons, colors, badges) help users quickly understand cluster state. The current context should be clearly marked as it's the default target for kubectl commands.

## Implementation Steps

1. Add icon theme support for different cluster states
2. Create icon mapping for:
   - Connected/available cluster
   - Disconnected cluster
   - Current context (active indicator)
3. Implement logic to determine cluster connection status
4. Add ThemeIcon to tree items based on status
5. Add badge or decoration for current context
6. Use VS Code's built-in icons where possible
7. Add tooltip showing full cluster details on hover

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add status icons and decorations
- `src/tree/TreeItem.ts` - Add icon and status properties

## Acceptance Criteria

- [ ] Each cluster has an appropriate status icon
- [ ] Current context is visually highlighted or marked
- [ ] Icons follow VS Code design conventions
- [ ] Tooltips display helpful cluster information on hover
- [ ] Status indicators update when cluster state changes
- [ ] Icons are visible in both light and dark themes
- [ ] Visual hierarchy is clear and intuitive

## Dependencies

- display-clusters-in-tree

