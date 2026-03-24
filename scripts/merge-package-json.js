#!/usr/bin/env node

const fs = require('fs');

const [, , basePath, patchPath, outputPath] = process.argv;

if (!basePath || !patchPath || !outputPath) {
    console.error('Usage: node scripts/merge-package-json.js <base> <patch> <output>');
    process.exit(1);
}

const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

const merged = merge(base, patch);
fs.writeFileSync(outputPath, `${JSON.stringify(merged, null, 2)}\n`);

function merge(baseValue, patchValue, key = '') {
    if (Array.isArray(baseValue) && Array.isArray(patchValue)) {
        if (key === 'theiaPluginsExcludeIds') {
            return Array.from(new Set([...baseValue, ...patchValue]));
        }
        return [...patchValue];
    }

    if (isObject(baseValue) && isObject(patchValue)) {
        const result = { ...baseValue };
        for (const [childKey, childValue] of Object.entries(patchValue)) {
            if (childValue === null) {
                delete result[childKey];
                continue;
            }
            result[childKey] = childKey in baseValue
                ? merge(baseValue[childKey], childValue, childKey)
                : childValue;
        }
        return result;
    }

    return patchValue;
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
