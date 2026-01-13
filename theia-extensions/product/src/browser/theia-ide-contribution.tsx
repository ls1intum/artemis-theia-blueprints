/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { inject, injectable } from '@theia/core/shared/inversify';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';
import { Command, CommandContribution, CommandRegistry } from '@theia/core/lib/common/command';
import { MenuContribution, MenuModelRegistry, MenuPath } from '@theia/core/lib/common/menu';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { ContributionFilterRegistry, FilterContribution } from '@theia/core/lib/common';
import { WidgetFactory } from '@theia/core/lib/browser';
import { OutlineViewContribution } from '@theia/outline-view/lib/browser/outline-view-contribution';
import { OutlineViewService } from '@theia/outline-view/lib/browser/outline-view-service';
import { OutlineBreadcrumbsContribution } from '@theia/outline-view/lib/browser/outline-breadcrumbs-contribution';
import { PluginFrontendViewContribution } from '@theia/plugin-ext/lib/main/browser/plugin-frontend-view-contribution';

export namespace TheiaIDEMenus {
    export const THEIA_IDE_HELP: MenuPath = [...CommonMenus.HELP, 'theia-ide'];
}
export namespace TheiaIDECommands {
    export const CATEGORY = 'TheiaIDE';
    export const REPORT_ISSUE: Command = {
        id: 'theia-ide:report-issue',
        category: CATEGORY,
        label: 'Report Issue'
    };
    export const DOCUMENTATION: Command = {
        id: 'theia-ide:documentation',
        category: CATEGORY,
        label: 'Documentation'
    };
}

/**
 * Filter to remove unwanted view contributions (Outline, Plugins) from the UI.
 * This uses Theia's official Contribution Filter API to prevent these widgets from being registered.
 *
 * Filter predicates return TRUE to KEEP a contribution, FALSE to REMOVE it.
 */
@injectable()
export class ViewsFilter implements FilterContribution {
    registerContributionFilters(registry: ContributionFilterRegistry): void {
        // Filter across all contribution types, this are the commands/menus/etc
        registry.addFilters(['*'], [
            contrib => {
                // Return false to remove these contributions
                if (contrib instanceof OutlineViewService) return false;
                if (contrib instanceof OutlineViewContribution) return false;
                if (contrib instanceof OutlineBreadcrumbsContribution) return false;
                if (contrib instanceof PluginFrontendViewContribution) return false;
                // Keep everything else
                return true;
            }
        ]);

        // Remove the actual widget factories, this are the actual ui components
        registry.addFilters([WidgetFactory], [
            factory => {
                const f = factory as WidgetFactory;
                if (f.id === 'outline-view') return false;
                if (f.id === 'plugins') return false;
                return true;
            }
        ]);
    }
}

@injectable()
export class TheiaIDEContribution implements CommandContribution, MenuContribution {

    @inject(WindowService)
    protected readonly windowService: WindowService;

    static REPORT_ISSUE_URL = 'https://github.com/eclipse-theia/theia-ide/issues/new?assignees=&labels=&template=bug_report.md';
    static DOCUMENTATION_URL = 'https://theia-ide.org/docs/user_getting_started/';

    registerCommands(commandRegistry: CommandRegistry): void {
        commandRegistry.registerCommand(TheiaIDECommands.REPORT_ISSUE, {
            execute: () => this.windowService.openNewWindow(TheiaIDEContribution.REPORT_ISSUE_URL, { external: true })
        });
        commandRegistry.registerCommand(TheiaIDECommands.DOCUMENTATION, {
            execute: () => this.windowService.openNewWindow(TheiaIDEContribution.DOCUMENTATION_URL, { external: true })
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(TheiaIDEMenus.THEIA_IDE_HELP, {
            commandId: TheiaIDECommands.REPORT_ISSUE.id,
            label: TheiaIDECommands.REPORT_ISSUE.label,
            order: '1'
        });
        menus.registerMenuAction(TheiaIDEMenus.THEIA_IDE_HELP, {
            commandId: TheiaIDECommands.DOCUMENTATION.id,
            label: TheiaIDECommands.DOCUMENTATION.label,
            order: '2'
        });
    }
}
