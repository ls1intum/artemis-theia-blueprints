/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { injectable } from '@theia/core/shared/inversify';
import { PluginDeployOptions, PluginIdentifiers, PluginServer, PluginStorageKind, PluginType } from '@robertjndw/plugin-ext';
import { KeysToAnyValues, KeysToKeysToAnyValue } from '@robertjndw/plugin-ext/lib/common/types';

@injectable()
export class FrontendPluginServer implements PluginServer {
    install(pluginEntry: string, type?: PluginType, options?: PluginDeployOptions): Promise<void> {
        throw new Error('Method not implemented.');
    }
    enablePlugin(pluginId: PluginIdentifiers.VersionedId): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    disablePlugin(pluginId: PluginIdentifiers.VersionedId): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    getInstalledPlugins(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        throw new Error('Method not implemented.');
    }
    getUninstalledPlugins(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        throw new Error('Method not implemented.');
    }
    getDisabledPlugins(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        throw new Error('Method not implemented.');
    }
    deploy(pluginEntry: string, type?: PluginType | undefined, options?: PluginDeployOptions | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
    uninstall(pluginId: `${string}.${string}@${string}`): Promise<void> {
        throw new Error('Method not implemented.');
    }
    undeploy(pluginId: `${string}.${string}@${string}`): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setStorageValue(key: string, value: KeysToAnyValues, kind: PluginStorageKind): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    getStorageValue(key: string, kind: PluginStorageKind): Promise<KeysToAnyValues> {
        throw new Error('Method not implemented.');
    }
    async getAllStorageValues(kind: PluginStorageKind): Promise<KeysToKeysToAnyValue> {
        return {};
    }

}
