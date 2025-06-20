/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { bindOPFSInitialization } from './filesystem/example-filesystem-initialization';
import { HostedPluginServer, PluginServer } from '@theia/plugin-ext';
import { PluginPathsService } from '@theia/plugin-ext/lib/main/common/plugin-paths-protocol';

import { FrontendHostedPluginServer } from './plugin/frontend-hosted-plugin-server';
import { FrontendPluginServer } from './plugin/frontend-plugin-server';
import { FrontendPluginPathService } from './plugin/frontend-plugin-path-service';

export default new ContainerModule((
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
) => {
    bindOPFSInitialization(bind, rebind);
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
    rebind(PluginServer).to(FrontendPluginServer).inSingletonScope();
    rebind(PluginPathsService).to(FrontendPluginPathService).inSingletonScope();
});
