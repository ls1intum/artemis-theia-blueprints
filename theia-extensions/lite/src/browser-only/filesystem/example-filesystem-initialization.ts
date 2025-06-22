/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { EncodingService } from '@theia/core/lib/common/encoding-service';
import { DefaultOPFSInitialization } from '@theia/filesystem/lib/browser-only/opfs-filesystem-initialization';
import { OPFSFileSystemProvider } from '@theia/filesystem/lib/browser-only/opfs-filesystem-provider';

@injectable()
export class ExampleOPFSInitialization extends DefaultOPFSInitialization {

    @inject(EncodingService)
    protected encodingService: EncodingService;

    override async initializeFS(provider: OPFSFileSystemProvider): Promise<void> {
        // Check whether the directory exists
        if (await provider.exists(new URI('/home'))) {
            await provider.readdir(new URI('/home'));
        } else {
            await provider.mkdir(new URI('/home'));
        }
    }
}
