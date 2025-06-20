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
import { HostedPluginServer } from '@theia/plugin-ext';
import { FrontendHostedPluginServer } from './plugin/frontend-hosted-plugin-server';

export default new ContainerModule((
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
) => {
    bindOPFSInitialization(bind, rebind);
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
});
