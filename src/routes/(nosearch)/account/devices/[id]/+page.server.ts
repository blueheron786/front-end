import { API_BASE as API } from '$lib/api';
import {
	errorsForDevice,
	loadProblem,
	type CrawlerError,
	type Device,
	type DeviceActivity,
	type LoadProblem
} from '$lib/devices';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// The API keeps at most 200 errors per user and serves at most 100 a request.
const ERRORS_PAGE_SIZE = 100;
const ERRORS_MAX_PAGES = 2;

// Interpolated into an API path, so anything but digits could reach another endpoint.
const DEVICE_ID = /^\d+$/;

export const actions: Actions = {
	updateDevice: async ({ request, cookies, params }) => {
		const data = await request.formData();
		const deviceName = (data.get('deviceName') as string | null)?.trim();

		if (!DEVICE_ID.test(params.id) || !deviceName) {
			return { success: false, error: 'Device name is required.' };
		}

		const res = await fetch(`${API}/api/v1/platform/devices/${params.id}`, {
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
	},

	hideDevice: async ({ cookies, params }) => {
		if (!DEVICE_ID.test(params.id)) {
			return { success: false, error: 'Device ID is required.' };
		}

		const res = await fetch(`${API}/api/v1/platform/devices/${params.id}`, {
			method: 'DELETE',
			headers: { Authorization: 'Bearer ' + cookies.get('accessToken') }
		});

		if (!res.ok) {
			return { success: false, error: 'Failed to remove device.' };
		}

		throw redirect(303, '/account/devices');
	}
};

export const load: PageServerLoad = async ({ cookies, locals, params }) => {
	if (locals.loginStatus !== 'assumeLoggedIn') {
		throw redirect(302, '/account');
	}
	if (!DEVICE_ID.test(params.id)) {
		throw error(404, 'Device not found');
	}

	const headers = { Authorization: 'Bearer ' + cookies.get('accessToken') };
	const fetchErrors = async (offset: number) => {
		const res = await fetch(
			`${API}/api/v1/platform/crawler-errors/?limit=${ERRORS_PAGE_SIZE}&offset=${offset}`,
			{ headers }
		);
		return res.ok ? ((await res.json()) as { count: number; items: CrawlerError[] }) : null;
	};

	const [devicesRes, activityRes, firstErrors] = await Promise.all([
		fetch(`${API}/api/v1/platform/devices/`, { headers }),
		fetch(`${API}/api/v1/platform/devices/activity/`, { headers }),
		fetchErrors(0)
	]);

	if (!devicesRes.ok) {
		const problem: LoadProblem = loadProblem(devicesRes.status);
		return { device: null, problem, activity: null, errors: [], errorsFailed: false };
	}

	const devices: Device[] = await devicesRes.json();
	const device = devices.find((d) => String(d.id) === params.id);
	if (!device) {
		throw error(404, 'Device not found');
	}

	const activity: DeviceActivity[] = activityRes.ok ? await activityRes.json() : [];

	const errors = firstErrors?.items ?? [];
	for (
		let page = 1;
		firstErrors && page < ERRORS_MAX_PAGES && errors.length < firstErrors.count;
		page++
	) {
		const more = await fetchErrors(page * ERRORS_PAGE_SIZE);
		if (!more) break;
		errors.push(...more.items);
	}

	return {
		device,
		problem: null,
		activity: activity.find((a) => a.device_id === device.id) ?? null,
		errors: errorsForDevice(errors, device),
		errorsFailed: firstErrors === null
	};
};
