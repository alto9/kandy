---
task_id: manual-testing-checklist
session_id: design-the-installation-and-setup-procedures-for-u
type: manual
status: pending
priority: high
---

## Description

Execute comprehensive manual testing of the initial configuration and installation flow to verify all scenarios work correctly.

## Reason

Automated tests may not catch all integration issues and user experience problems. Manual testing ensures the complete flow works smoothly and matches the feature specifications from initial-configuration.feature.md.

## Steps

### Fresh Installation Testing
1. Uninstall any existing Kandy extension
2. Clear VS Code global state related to Kandy
3. Install extension from VSIX package
4. Verify extension activates automatically
5. Verify welcome screen appears on first launch
6. Check that all welcome screen content is present and readable

### Welcome Screen Testing
7. Verify Kandy logo and title display correctly
8. Confirm quick start guide lists core features
9. Check authentication section explains API keys are optional
10. Verify link to portal.kandy.dev works
11. Test "Do not show this again" checkbox (unchecked)
12. Click Close and restart VS Code
13. Verify welcome screen appears again
14. Test "Do not show this again" checkbox (checked)
15. Click Close and restart VS Code
16. Verify welcome screen does NOT appear

### Cluster Detection Testing
17. Test with valid kubeconfig at ~/.kube/config
18. Verify clusters appear in tree view
19. Verify context names are shown
20. Verify current context is highlighted
21. Test with missing kubeconfig file
22. Verify error message is helpful and non-blocking
23. Test with empty kubeconfig file
24. Verify appropriate message is shown
25. Test with invalid/corrupted kubeconfig YAML
26. Verify error handling and user message

### KUBECONFIG Environment Variable Testing
27. Set custom KUBECONFIG environment variable
28. Verify extension reads from custom location
29. Unset variable and verify fallback to ~/.kube/config

### Tree View Testing
30. Verify tree view appears in activity bar
31. Test clicking on cluster items
32. Test refresh command
33. Verify tree updates after kubeconfig changes
34. Test with multiple clusters
35. Test with no clusters

### Authentication Context Testing
36. Use extension without API key configured
37. Verify core features work (cluster viewing)
38. Check that auth messaging appears appropriately
39. Test "Configure API Key" command
40. Verify it opens settings to correct location
41. Configure an API key
42. Verify auth messages update accordingly

### Performance Testing
43. Measure extension activation time (should be < 2 seconds)
44. Verify tree view loads without blocking UI
45. Test with large kubeconfig (many clusters)
46. Verify responsiveness is maintained

### Theme Testing
47. Test welcome screen in light theme
48. Test welcome screen in dark theme
49. Verify all UI elements are visible in both themes
50. Check contrast and readability

## Resources

- Test kubeconfig files (valid, empty, invalid)
- VSIX package for installation
- VS Code instance for testing
- Documentation for verification

## Completion Criteria

- [ ] Fresh installation shows welcome screen on first launch
- [ ] Welcome screen content matches specifications
- [ ] "Do not show this again" checkbox works correctly
- [ ] Valid kubeconfig is parsed and displays clusters
- [ ] Missing kubeconfig is handled gracefully
- [ ] Invalid kubeconfig shows appropriate error message
- [ ] KUBECONFIG environment variable is respected
- [ ] Tree view displays clusters correctly
- [ ] Current context is visually highlighted
- [ ] Core features work without API key
- [ ] Authentication messaging is clear and helpful
- [ ] Extension activation completes within 2 seconds
- [ ] UI is responsive and doesn't block on loading
- [ ] Welcome screen matches VS Code theme
- [ ] All error scenarios are handled gracefully
- [ ] No errors appear in VS Code Developer Console

