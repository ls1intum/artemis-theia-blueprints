/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { URI } from '@theia/core';
import { FileSystemProvider, FileType, hasReadWriteCapability } from '@theia/filesystem/lib/common/files';

export interface FSPromises {
    readFile(path: string, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<string | Uint8Array>;
    writeFile(file: string, data: string | Uint8Array, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<void>;
    unlink(path: string): Promise<void>;
    readdir(path: string, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<string[]>;
    mkdir(path: string, mode?: number): Promise<void>;
    rmdir(path: string): Promise<void>;
    stat(path: string): Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }>;
    lstat(path: string): Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }>;
}

export class DefaultOPFSWrapper implements FSPromises {
    protected readonly provider: FileSystemProvider;

    constructor(provider: FileSystemProvider) {
        this.provider = provider;
        // Ensure "promises" is set at the top-level
        this.promises = {
            readFile: this.readFile.bind(this),
            writeFile: this.writeFile.bind(this),
            unlink: this.unlink.bind(this),
            readdir: this.readdir.bind(this),
            mkdir: this.mkdir.bind(this),
            rmdir: this.rmdir.bind(this),
            stat: this.stat.bind(this),
            lstat: this.lstat.bind(this),
            readlink: async () => { throw new Error('OPFS does not support readlink.'); },
            symlink: async () => { throw new Error('OPFS does not support symlink.'); },
            chmod: async () => { throw new Error('OPFS does not support chmod.'); }
        };
    }

    promises: {
        readFile: (path: string, options?: { encoding?: BufferEncoding } | BufferEncoding) => Promise<string | Uint8Array>;
        writeFile: (file: string, data: string | Uint8Array, options?: { encoding?: BufferEncoding } | BufferEncoding) => Promise<void>;
        unlink: (path: string) => Promise<void>;
        readdir: (path: string, options?: { encoding?: BufferEncoding } | BufferEncoding) => Promise<string[]>;
        mkdir: (path: string, mode?: number) => Promise<void>;
        rmdir: (path: string) => Promise<void>;
        stat: (path: string) => Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }>;
        lstat: (path: string) => Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }>;
        readlink: (path: string) => Promise<string>;
        symlink: (target: string, path: string) => Promise<void>;
        chmod: (path: string, mode: number) => Promise<void>;
    };

    async readFile(path: string, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<string | Uint8Array> {
        if (path === undefined) {
            throw new Error('path is undefined');
        }
        if (hasReadWriteCapability(this.provider)) {
            const uri = new URI(path);
            const data = await this.provider.readFile(uri);

            // Convert Uint8Array to string if encoding is specified
            if (typeof options === 'string' || (options && options.encoding)) {
                return new TextDecoder().decode(data);
            }

            return data;
        }
        throw new Error('not supported');
    }

    async writeFile(file: string, data: string | Uint8Array, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<void> {
        if (hasReadWriteCapability(this.provider)) {
            const uri = new URI(file);
            const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;

            await this.provider.writeFile(uri, content, { create: true, overwrite: true });
            return;
        }
        throw new Error('not supported');
    }

    async unlink(path: string): Promise<void> {
        const uri = new URI(path);
        await this.provider.delete(uri, {
            recursive: false,
            useTrash: false
        });
    }

    async readdir(path: string, options?: { encoding?: BufferEncoding } | BufferEncoding): Promise<string[]> {
        const uri = new URI(path);
        const entries = await this.provider.readdir(uri);
        return entries.map(([name]) => name);
    }

    async mkdir(path: string, mode?: number): Promise<void> {
        const uri = new URI(path);
        await this.provider.mkdir(uri);
    }

    async rmdir(path: string): Promise<void> {
        const uri = new URI(path);
        await this.provider.delete(uri, {
            recursive: true,
            useTrash: false
        });
    }

    async stat(path: string): Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }> {
        const uri = new URI(path);
        try {
            const stats = await this.provider.stat(uri);

            return {
                size: stats.size,
                mtime: stats.mtime,
                ctime: stats.ctime,
                isFile: () => stats.type === FileType.File,
                isDirectory: () => stats.type === FileType.Directory,
            };
        } catch (error) {
            const err: NodeJS.ErrnoException = new Error(`ENOENT: no such file or directory, stat '${path}'`) as NodeJS.ErrnoException;
            err.code = 'ENOENT';
            err.syscall = 'stat';
            err.path = path;
            throw err;
        }
    }

    async lstat(path: string): Promise<{ size: number; mtime: number; ctime: number; isFile: () => boolean; isDirectory: () => boolean; }> {
        return this.stat(path); // OPFS doesn't support symlinks, so lstat is identical to stat
    }
}
