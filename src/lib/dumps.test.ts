import { describe, expect, it } from 'vitest';

import {
	fileName,
	formatBytes,
	formatDuration,
	licenseLabel,
	sortDumps,
	type IndexDump
} from './dumps';

const dump: IndexDump = {
	key: 'index/index-v2-400G.tinysearch/full/2026-11-01T031720Z.zst',
	url: 'https://example.com/index/index-v2-400G.tinysearch/full/2026-11-01T031720Z.zst',
	manifest_url:
		'https://example.com/index/index-v2-400G.tinysearch/full/2026-11-01T031720Z.zst.json',
	index_name: 'index-v2-400G.tinysearch',
	page_size: 4096,
	num_pages: 102400000,
	size: 419430404096,
	compressed_size: 252942682275,
	sha256: '9ae40349e8712a7f7546f136b86f64452d4f931167f12c00569e0d84d5c98552',
	started: '2026-11-01T03:17:20.383Z',
	finished: '2026-11-01T06:33:37.348Z',
	license: 'CC-BY-NC-SA-4.0',
	license_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
};

describe('formatBytes', () => {
	it('uses decimal units', () => {
		expect(formatBytes(252942682275)).toBe('252.9 GB');
		expect(formatBytes(419430404096)).toBe('419.4 GB');
		expect(formatBytes(1_500_000_000_000)).toBe('1.5 TB');
	});

	it('leaves small sizes in bytes', () => {
		expect(formatBytes(512)).toBe('512 B');
	});
});

describe('formatDuration', () => {
	it('gives hours and minutes', () => {
		expect(formatDuration(dump.started, dump.finished)).toBe('3 h 16 min');
	});

	it('gives minutes alone under an hour', () => {
		expect(formatDuration('2026-11-01T00:00:00Z', '2026-11-01T00:42:10Z')).toBe('42 min');
	});

	it('gives nothing for bad timestamps', () => {
		expect(formatDuration('nope', dump.finished)).toBeNull();
		expect(formatDuration(dump.finished, dump.started)).toBeNull();
	});
});

describe('fileName', () => {
	it('is the last part of the key', () => {
		expect(fileName(dump)).toBe('2026-11-01T031720Z.zst');
	});
});

describe('licenseLabel', () => {
	it('formats Creative Commons ids', () => {
		expect(licenseLabel('CC-BY-NC-SA-4.0')).toBe('CC BY-NC-SA 4.0');
	});

	it('leaves other ids alone', () => {
		expect(licenseLabel('MIT')).toBe('MIT');
	});
});

describe('sortDumps', () => {
	it('puts the newest first without changing the input', () => {
		const older = { ...dump, finished: '2026-10-01T06:00:00Z' };
		const input = [older, dump];
		expect(sortDumps(input)).toEqual([dump, older]);
		expect(input).toEqual([older, dump]);
	});
});
