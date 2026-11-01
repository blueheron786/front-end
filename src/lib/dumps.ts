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

// Newest first, by when the dump finished; ISO timestamps sort as strings.
export function sortDumps(dumps: IndexDump[]): IndexDump[] {
	return [...dumps].sort((a, b) => b.finished.localeCompare(a.finished));
}

// The file's name within the bucket, e.g. 2026-11-01T031720Z.zst.
export function fileName(dump: IndexDump): string {
	return dump.key.split('/').at(-1) ?? dump.key;
}

const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];

// Decimal units, as disks and download tools report sizes.
export function formatBytes(bytes: number): string {
	let value = bytes;
	let unit = 0;
	while (value >= 1000 && unit < UNITS.length - 1) {
		value /= 1000;
		unit++;
	}
	return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${UNITS[unit]}`;
}

export function formatDuration(started: string, finished: string): string | null {
	const ms = Date.parse(finished) - Date.parse(started);
	if (!Number.isFinite(ms) || ms < 0) return null;
	const minutes = Math.round(ms / 60_000);
	const hours = Math.floor(minutes / 60);
	if (hours === 0) return `${minutes} min`;
	return `${hours} h ${minutes % 60} min`;
}

// SPDX ids like CC-BY-NC-SA-4.0 read better as CC BY-NC-SA 4.0.
export function licenseLabel(license: string): string {
	const match = /^CC-(.+)-(\d+\.\d+)$/.exec(license);
	return match ? `CC ${match[1]} ${match[2]}` : license;
}
