/********************************************************************************
 * Copyright (C) 2025 robertjndw.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { injectable } from '@theia/core/shared/inversify';
import { Event, Emitter } from '@theia/core';
import { WidgetOpenerOptions } from '@theia/core/lib/browser';
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { TerminalWidget, TerminalWidgetOptions } from '@theia/terminal/lib/browser/base/terminal-widget';

@injectable()
export class TerminalFrontendOnlyContribution implements TerminalService {
    protected readonly onDidCreateTerminalEmitter = new Emitter<TerminalWidget>();
    protected readonly onDidChangeCurrentTerminalEmitter = new Emitter<TerminalWidget | undefined>();

    get onDidCreateTerminal(): Event<TerminalWidget> {
        return this.onDidCreateTerminalEmitter.event;
    }

    get onDidChangeCurrentTerminal(): Event<TerminalWidget | undefined> {
        return this.onDidChangeCurrentTerminalEmitter.event;
    }

    get currentTerminal(): TerminalWidget | undefined {
        return undefined;
    }

    get lastUsedTerminal(): TerminalWidget | undefined {
        return undefined;
    }

    async newTerminal(options: TerminalWidgetOptions): Promise<TerminalWidget> {
        throw new Error('Method not implemented.');
    }

    open(terminal: TerminalWidget, options?: WidgetOpenerOptions): void {
        return;
    }

    get all(): TerminalWidget[] {
        return [];
    }

    getById(id: string): TerminalWidget | undefined {
        return undefined;
    }

    getByTerminalId(terminalId: number): TerminalWidget | undefined {
        return undefined;
    }

    async getDefaultShell(): Promise<string> {
        return '';
    }
}
