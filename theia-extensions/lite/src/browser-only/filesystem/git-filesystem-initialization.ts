/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { URI } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { DefaultOPFSInitialization } from '@theia/filesystem/lib/browser-only/opfs-filesystem-initialization';
import { OPFSFileSystemProvider } from '@theia/filesystem/lib/browser-only/opfs-filesystem-provider';

import { Endpoint } from '@theia/core/lib/browser/endpoint';
import { DefaultOPFSWrapper } from './opfs-wrapper';

import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

@injectable()
export class GitOPFSInitialization extends DefaultOPFSInitialization {

    override async initializeFS(provider: OPFSFileSystemProvider): Promise<void> {
        // Check whether the directory exists
        if (await provider.exists(new URI('/home'))) {
            await provider.readdir(new URI('/home'));
        } else {
            await provider.mkdir(new URI('/home'));
        }

        // Try to fetch the git URL using the Endpoint class
        const gitURI = new Endpoint({ path: '/git-url' });
        try {
            const response = await fetch(gitURI.getRestUrl().toString());
            const gitUrl = await response.text();
            console.log('Git URL:', gitUrl);

            const gitwrapper = new DefaultOPFSWrapper(provider);
            console.log('Git OPFS Wrapper initialized:', gitwrapper);
            await git.clone({
                fs: gitwrapper,
                http,
                dir: '/home', // TODO: Change this to the desired directory
                // corsProxy: 'http://localhost:3001', // TODO change this
                corsProxy: 'https://git-proxy.theia.artemis.cit.tum.de', // TODO change this
                url: gitUrl,
                singleBranch: true,
                depth: 1
            });
        } catch (error) {
            console.error('Error fetching git URL:', error);
        }
    }
}
