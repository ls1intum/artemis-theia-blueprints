/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { HostedPluginServer, PluginServer } from '@theia/plugin-ext';
import { PluginPathsService } from '@theia/plugin-ext/lib/main/common/plugin-paths-protocol';

import { FrontendHostedPluginServer } from './plugin/frontend-hosted-plugin-server';
import { FrontendPluginServer } from './plugin/frontend-plugin-server';
import { FrontendPluginPathService } from './plugin/frontend-plugin-path-service';
import { ExampleOPFSInitialization } from './filesystem/example-filesystem-initialization';
import { OPFSInitialization } from '@theia/filesystem/lib/browser-only/opfs-filesystem-initialization';

export default new ContainerModule((
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
) => {
    bind(ExampleOPFSInitialization).toSelf();
    rebind(OPFSInitialization).toService(ExampleOPFSInitialization);
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
    rebind(PluginServer).to(FrontendPluginServer).inSingletonScope();
    rebind(PluginPathsService).to(FrontendPluginPathService).inSingletonScope();
});
