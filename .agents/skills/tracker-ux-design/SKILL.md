---
name: tracker-ux-design
description: Design and review information architecture, layouts, forms, and responsive interactions for the personal tracker, including workout history, calendar, and exercise logging.
---

# Tracker UX design

1. Start with what the user needs to see and do. Map the entry point, primary action, result, and return path. Give each screen one primary action.
2. For the gym, sketch browsing and editing separately. Make the chosen date and its workouts obvious. In the editor, group sets under their exercise, keep weight and repetitions aligned, and show the save action and result. Preserve entered values when a save fails.
3. Sketch with real content on desktop and phone before changing styles. Compare a dense history day and an empty day. Use typography, spacing, dividers, and one accent to communicate hierarchy. Reuse components where their behavior matches.
4. In a browser, select a past day, enter two exercises with different sets, save, reopen, edit, and check the catalog. Check narrow widths, keyboard focus, touch targets, and errors. State which checks were actually run.

## References

- [UI Store UI Kits](https://www.uistore.design/categories/ui-kits/) and [Figma Community UI Kits](https://www.figma.com/community/ui-kits?resource_type=files&editor_type=figma): look for calendar navigation, date selection, and form layout patterns.
- [Fitness Free App UI Kit](https://www.uistore.design/items/fitness-free-app-ui-kit-for-figma/): candidate for mobile fitness tracking patterns.
- [Figma infographic templates](https://www.figma.com/community/data-templates/infographics?resource_type=files&editor_type=figma): consult for progress views when enough real history exists.
- [OpenAI frontend guidance](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4) and [Vercel Web Interface Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): use for hierarchy and interface review.
