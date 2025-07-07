/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from '@theia/core/shared/inversify';
import { Event, RpcConnectionEventEmitter } from '@theia/core';
import { staticMetadata } from './static-plugin-metadata';
import { DeployedPlugin, ExtPluginApi, HostedPluginClient, HostedPluginServer, PluginIdentifiers } from '@theia/plugin-ext';

@injectable()
export class FrontendHostedPluginServer implements HostedPluginServer, RpcConnectionEventEmitter {
    readonly onDidOpenConnection: Event<void> = Event.None;
    readonly onDidCloseConnection: Event<void> = Event.None;

    async getDeployedPluginIds(): Promise<PluginIdentifiers.VersionedId[]> {
        // Use the plugin metadata to build the correct plugin id
        return staticMetadata.map(p => PluginIdentifiers.componentsToVersionedId(p.metadata.model));
    }
    async getUninstalledPluginIds(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        return [];

    }

    async getDisabledPluginIds(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        return [];
    }

    async getDeployedPlugins(ids: PluginIdentifiers.VersionedId[]): Promise<DeployedPlugin[]> {
        return staticMetadata.filter(p => ids.includes(PluginIdentifiers.componentsToVersionedId(p.metadata.model)));
    }

    async getExtPluginAPI(): Promise<ExtPluginApi[]> {
        return [];
    }
    onMessage(targetHost: string, message: Uint8Array): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }
    setClient(client: HostedPluginClient | undefined): void {
        throw new Error('Method not implemented.');
    }
    getClient?(): HostedPluginClient | undefined {
        throw new Error('Method not implemented.');
    }
}
