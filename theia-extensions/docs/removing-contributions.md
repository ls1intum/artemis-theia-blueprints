# Removing Theia Contributions and Widgets

This document explains how to remove unwanted UI views and contributions from the Theia IDE.

## Overview

Two complementary approaches are used:
1. **Contribution Filter** - Prevents contributions from registering (preferred)
2. **Runtime Disabler** - Unregisters commands and blocks widgets at runtime (additional protection)

## Implementation Location

Both implementations are in:
- `theia-extensions/product/src/browser/theia-ide-contribution.tsx` - Filter classes
- `theia-extensions/product/src/browser/theia-ide-frontend-module.ts` - Registration

## Approach 1: Contribution Filter (Preferred)

### When to Use
- You know the contribution class to remove
- You want to remove all commands/menus/keybindings from that class
- Clean removal at registration time

### How to Filter a View/Widget

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

### Step 3: Add to ViewsFilter

Edit `theia-extensions/product/src/browser/theia-ide-contribution.tsx`:

1. Import the contribution class:
```typescript
import { ViewContribution } from '@theia/package-name/lib/browser/view-contribution';
```

2. Add to `FILTERED_CONTRIBUTIONS` Set:
```typescript
private static readonly FILTERED_CONTRIBUTIONS = new Set<Function>([
    OutlineViewService,
    OutlineViewContribution,
    ViewContribution  // Add new class here
]);
```

3. Add widget factory ID to `FILTERED_WIDGET_IDS` Set:
```typescript
private static readonly FILTERED_WIDGET_IDS = new Set<string>([
    'outline-view',
    'view-id'  // Add new widget ID here
]);
```

## Approach 2: Runtime Disabler

### When to Use
- You only know specific command/widget IDs (not the contribution class)
- You need protection against restored layouts
- Contribution filter isn't sufficient

### How to Disable Features at Runtime

Edit `theia-extensions/product/src/browser/theia-ide-contribution.tsx`:

1. Add widget ID to `DISABLED_WIDGET_IDS`:
```typescript
private static readonly DISABLED_WIDGET_IDS = new Set<string>([
    'scm-view-container',
    'your-widget-id'  // Add here
]);
```

2. Add command IDs to `DISABLED_COMMAND_IDS`:
```typescript
private static readonly DISABLED_COMMAND_IDS = new Set<string>([
    'testing.runAll',
    'your.command.id'  // Add here
]);
```

## Example: Current Configuration

**Contribution Filter** removes (complete removal):
- Outline View (OutlineViewContribution, OutlineViewService, OutlineBreadcrumbsContribution)
- VSX Extensions Marketplace (VSXExtensionsContribution)
- SCM View - Source Control (ScmContribution)
- Debug View (DebugFrontendApplicationContribution)

**Runtime Disabler** provides additional protection for:
- All widgets from the above features (defense against restored layouts)
## Which Approach to Use?