/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from '@theia/core/shared/inversify';
import { PluginPathsService } from '@robertjndw/plugin-ext/lib/main/common/plugin-paths-protocol';

@injectable()
export class FrontendPluginPathService implements PluginPathsService {
    async getHostLogPath(): Promise<string> {
        return '';
    }
    async getHostStoragePath(workspaceUri: string | undefined, rootUris: string[]): Promise<string | undefined> {
        return '';
    }

}
