# Removing Theia Contributions and Widgets

This document explains how to remove unwanted UI views and contributions from the Theia IDE using the Contribution Filter API.

## Overview

Theia's Contribution Filter API allows you to selectively remove contributions (commands, menus, keybindings, widgets) from the UI without modifying the source packages.

## Implementation Location

The filter implementation is in:
- `theia-extensions/product/src/browser/theia-ide-contribution.tsx` - Filter class
- `theia-extensions/product/src/browser/theia-ide-frontend-module.ts` - Registration

## How to Filter a View/Widget

### Step 1: Identify the Contribution Class

Find the contribution class you want to remove. Common examples:
- `OutlineViewContribution` - Outline sidebar view
- `VSXExtensionsContribution` - Extensions marketplace (Ctrl+Shift+X)
- `PluginFrontendViewContribution` - Installed plugins list

### Step 2: Find the Widget Factory ID

Widget factories have an `id` property. Common examples:
- `'outline-view'` - Outline view
- `'vsx-extensions-view-container'` - Extensions marketplace
- `'plugins'` - Installed plugins list

You can find these by searching the package source code:
```bash
grep -r "id.*=.*'view-name'" node_modules/@theia/package-name/
```

### Step 3: Add to Filter

Edit `theia-extensions/product/src/browser/theia-ide-contribution.tsx`:

1. Import the contribution class:
```typescript
import { ViewContribution } from '@theia/package-name/lib/browser/view-contribution';
```

2. Add instanceof check in the filter function:
```typescript
const filter = (contrib: Object) => {
    if (contrib instanceof ViewContribution) return false;
    // ... other filters
    return true;
};
```

3. Add widget factory ID to the WidgetFactory filter:
```typescript
registry.addFilters([WidgetFactory], [
    factory => {
        const f = factory as WidgetFactory;
        if (f.id === 'view-id') return false;
        return true;
    }
]);
```
## Example: Filtering Outline View

```typescript
import { OutlineViewContribution } from '@theia/outline-view/lib/browser/outline-view-contribution';
import { OutlineViewService } from '@theia/outline-view/lib/browser/outline-view-service';

const filter = (contrib: Object) => {
    if (contrib instanceof OutlineViewContribution) return false;
    if (contrib instanceof OutlineViewService) return false;
    return true;
};

registry.addFilters([CommandContribution], [filter]);
// ... other contribution types

registry.addFilters([WidgetFactory], [
    factory => {
        const f = factory as WidgetFactory;
        if (f.id === 'outline-view') return false;
        return true;
    }
]);
```
## References

- [Theia Contribution Filter Documentation](https://theia-ide.org/docs/contribution_filter/)
- Current implementation: `theia-extensions/product/src/browser/theia-ide-contribution.tsx`
