/********************************************************************************
 * Copyright (C) 2026 EduIDE and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { execSync } from 'child_process';

const RETRY_SCHEDULE_SECONDS = [60, randomIntInclusive(300, 600), randomIntInclusive(600, 1800)];

run().catch(error => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`download:plugins:retry failed: ${message}`);
    process.exit(1);
});

async function run(): Promise<void> {
    for (let attempt = 1; attempt <= RETRY_SCHEDULE_SECONDS.length; attempt++) {
        try {
            console.log(`[download:plugins:retry] Attempt ${attempt}/${RETRY_SCHEDULE_SECONDS.length}`);
            execSync('yarn download:plugins', { stdio: 'inherit' });
            console.log('[download:plugins:retry] Success');
            return;
        } catch (error) {
            if (attempt === RETRY_SCHEDULE_SECONDS.length) {
                throw new Error(`Plugin download failed after ${attempt} attempts`);
            }

            const delaySec = RETRY_SCHEDULE_SECONDS[attempt - 1];
            const minutes = Math.floor(delaySec / 60);
            const seconds = delaySec % 60;
            console.warn(
                `[download:plugins:retry] Attempt ${attempt} failed; waiting ${minutes}m ${seconds}s before retry`
            );
            await sleep(delaySec * 1000);
        }
    }
}

function randomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
