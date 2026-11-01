// One entry from GET /api/v1/search/dumps.
export interface IndexDump {
	key: string;
	url: string;
	manifest_url: string;
	index_name: string;
	page_size: number;
	num_pages: number;
	size: number;
	compressed_size: number;
	sha256: string;
	started: string;
	finished: string;
	license: string;
	license_url: string;
}

const STRING_FIELDS = [
	'key',
	'url',
	'manifest_url',
	'index_name',
	'sha256',
	'started',
	'finished',
	'license',
	'license_url'
] as const;
const NUMBER_FIELDS = ['page_size', 'num_pages', 'size', 'compressed_size'] as const;

function isDump(value: unknown): value is IndexDump {
	if (typeof value !== 'object' || value === null) return false;
	const entry = value as Record<string, unknown>;
	return (
		STRING_FIELDS.every((field) => typeof entry[field] === 'string') &&
		NUMBER_FIELDS.every((field) => Number.isFinite(entry[field])) &&
		Number.isFinite(Date.parse(entry.finished as string))
	);
}

// Keeps only complete dumps, so one malformed or unfinished entry doesn't break the page.
// Null when the response isn't a list at all.
export function parseDumps(body: unknown): IndexDump[] | null {
	if (!Array.isArray(body)) return null;
	return sortDumps(body.filter(isDump));
}

// Newest first, by when the dump finished. Compared as instants, so offsets and
// fractional seconds don't matter.
export function sortDumps(dumps: IndexDump[]): IndexDump[] {
	return [...dumps].sort((a, b) => Date.parse(b.finished) - Date.parse(a.finished));
}

// The file's name within the bucket, e.g. 2026-11-01T031720Z.zst.
export function fileName(dump: IndexDump): string {
	return dump.key.split('/').filter(Boolean).at(-1) ?? dump.key;
}

const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];

// Decimal units, as disks and download tools report sizes.
export function formatBytes(bytes: number): string {
	if (bytes < 1000) return `${bytes} B`;
	let value = bytes;
	let unit = 0;
	// Step up after rounding too, so 999,960 B reads 1.0 MB rather than 1000.0 kB.
	while (unit < UNITS.length - 1 && Number(value.toFixed(1)) >= 1000) {
		value /= 1000;
		unit++;
	}
	return `${value.toFixed(1)} ${UNITS[unit]}`;
}

export function formatDuration(started: string, finished: string): string | null {
	const ms = Date.parse(finished) - Date.parse(started);
	if (!Number.isFinite(ms) || ms < 0) return null;
	const minutes = Math.round(ms / 60_000);
	if (minutes < 1) return 'under a minute';
	const hours = Math.floor(minutes / 60);
	if (hours === 0) return `${minutes} min`;
	return minutes % 60 === 0 ? `${hours} h` : `${hours} h ${minutes % 60} min`;
}

// SPDX ids like CC-BY-NC-SA-4.0 read better as CC BY-NC-SA 4.0.
export function licenseLabel(license: string): string {
	const match = /^CC-(.+)-(\d+\.\d+)$/.exec(license);
	return match ? `CC ${match[1]} ${match[2]}` : license;
}
