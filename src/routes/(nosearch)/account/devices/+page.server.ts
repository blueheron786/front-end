import { API_BASE as API } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const ERRORS_PER_PAGE = 20;

type Device = {
	id: number;
	hostname: string;
	friendly_name: string | null;
	first_seen: string;
	last_seen: string;
	results_total: number;
	results_last_hour: number;
	results_last_24h: number;
	results_daily: { date: string; results: number }[];
};

type CrawlerError = {
	id: number;
	device_name: string;
	context: string;
	exception_type: string;
	message: string;
	location: string;
	crawler_version: string;
	created_at: string;
};

export const actions: Actions = {
	updateDevice: async ({ request, cookies }) => {
		const data = await request.formData();
		const deviceId = data.get('deviceId');
		const deviceName = (data.get('deviceName') as string | null)?.trim();

		if (!deviceId || !deviceName) {
			return { success: false, error: 'Device ID and name are required.' };
		}

		const res = await fetch(`${API}/api/v1/platform/devices/${deviceId}`, {
			method: 'PATCH',
			headers: {
				Authorization: 'Bearer ' + cookies.get('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friendly_name: deviceName })
		});

		if (!res.ok) {
			return { success: false, error: 'Failed to update device name.' };
		}

		return { success: true };
	}
};

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
	if (locals.loginStatus !== 'assumeLoggedIn') {
		throw redirect(302, '/account');
	}

	const requestedPage = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const headers = { Authorization: 'Bearer ' + cookies.get('accessToken') };

	const [devicesRes, errorsRes] = await Promise.all([
		fetch(`${API}/api/v1/platform/devices/`, { headers }),
		fetch(
			`${API}/api/v1/platform/crawler-errors/?limit=${ERRORS_PER_PAGE}&offset=${(page - 1) * ERRORS_PER_PAGE}`,
			{ headers }
		)
	]);

	const devices: Device[] = devicesRes.ok ? await devicesRes.json() : [];
	const errors: { count: number; items: CrawlerError[] } = errorsRes.ok
		? await errorsRes.json()
		: { count: 0, items: [] };
	const pageCount = Math.max(1, Math.ceil(errors.count / ERRORS_PER_PAGE));

	// Errors are trimmed as new ones arrive, so a bookmarked page can fall off the end.
	if (page > pageCount) {
		throw redirect(302, `?page=${pageCount}`);
	}

	return {
		devices,
		errors: errors.items,
		errorCount: errors.count,
		page,
		pageCount,
		loadFailed: !devicesRes.ok || !errorsRes.ok
	};
};
