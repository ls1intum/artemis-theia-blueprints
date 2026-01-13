/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import '../../src/browser/style/index.css';

import { WidgetFactory } from '@theia/core/lib/browser';
import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { CommandContribution } from '@theia/core/lib/common/command';
import { ContainerModule } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { OutlineViewContribution } from '@theia/outline-view/lib/browser/outline-view-contribution';
import { PluginFrontendViewContribution } from '@theia/plugin-ext/lib/main/browser/plugin-frontend-view-contribution';
import { TheiaIDEAboutDialog } from './theia-ide-about-dialog';
import { TheiaIDEContribution } from './theia-ide-contribution';
import { TheiaIDEGettingStartedWidget } from './theia-ide-getting-started-widget';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    bind(TheiaIDEGettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: GettingStartedWidget.ID,
        createWidget: () => context.container.get<TheiaIDEGettingStartedWidget>(TheiaIDEGettingStartedWidget),
    })).inSingletonScope();
    if (isBound(AboutDialog)) {
        rebind(AboutDialog).to(TheiaIDEAboutDialog).inSingletonScope();
    } else {
        bind(AboutDialog).to(TheiaIDEAboutDialog).inSingletonScope();
    }

    bind(TheiaIDEContribution).toSelf().inSingletonScope();
    [CommandContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(TheiaIDEContribution)
    );

    // Removing the outline view as a dependency does not work since it is referenced in other dependencies.
    // By replacing the contribution with an empty implementation, we effectively disable it.
    rebind(OutlineViewContribution).toConstantValue({
        initializeLayout: () => { },
        registerCommands: () => { },
        registerKeybindings: () => { },
        registerMenus: () => { },
        registerToolbarItems: () => { }
    } as any);

    // Disable the plugins (extensions) view from @theia/plugin-ext
    // Must provide a complete stub including getters that AbstractViewContribution expects
    rebind(PluginFrontendViewContribution).toConstantValue({
        registerCommands: () => { },
        registerKeybindings: () => { },
        registerMenus: () => { },
        get viewId() { return ''; },
        get viewLabel() { return ''; },
        get widget() { return Promise.reject(); },
        tryGetWidget: () => undefined,
        openView: () => Promise.reject(),
        closeView: () => Promise.reject(),
        toggleView: () => Promise.reject()
    } as any);
});
