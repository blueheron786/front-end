export type Device = {
	id: number;
	hostname: string;
	friendly_name: string | null;
	// Absent from an API that predates it, and null until the crawler reports one.
	crawler_version?: string | null;
	first_seen: string;
	last_seen: string;
};

export type DayResults = { date: string; results: number };

export type DeviceActivity = {
	device_id: number;
	results_total: number;
	results_last_hour: number;
	results_last_24h: number;
	results_daily: DayResults[];
};

export type CrawlerError = {
	id: number;
	device_name: string;
	device_display_name: string;
	context: string;
	exception_type: string;
	message: string;
	location: string;
	crawler_version: string;
	created_at: string;
};

/** Why a request for the user's devices failed: the API refuses unverified accounts with 403. */
export type LoadProblem = 'unverified' | 'unavailable';

export function loadProblem(status: number): LoadProblem {
	return status === 403 ? 'unverified' : 'unavailable';
}

export function deviceName(device: Pick<Device, 'hostname' | 'friendly_name'>): string {
	return device.friendly_name ?? device.hostname;
}

/** Errors are recorded under the crawler's hostname, which is what a device is keyed on. */
export function errorsForDevice<T extends { device_name: string }>(
	errors: T[],
	device: Pick<Device, 'hostname'>
): T[] {
	return errors.filter((error) => error.device_name === device.hostname);
}
