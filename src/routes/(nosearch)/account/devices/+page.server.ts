import { API_BASE as API } from '$lib/api';
import { loadProblem, type Device, type DeviceActivity, type LoadProblem } from '$lib/devices';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	if (locals.loginStatus !== 'assumeLoggedIn') {
		throw redirect(302, '/account');
	}

	const headers = { Authorization: 'Bearer ' + cookies.get('accessToken') };
	const [devicesRes, activityRes] = await Promise.all([
		fetch(`${API}/api/v1/platform/devices/`, { headers }),
		fetch(`${API}/api/v1/platform/devices/activity/`, { headers })
	]);

	const devices: Device[] = devicesRes.ok ? await devicesRes.json() : [];
	// Counts are a bonus: without them the table still lists the devices.
	const activity: DeviceActivity[] = activityRes.ok ? await activityRes.json() : [];
	const problem: LoadProblem | null = devicesRes.ok ? null : loadProblem(devicesRes.status);

	return {
		devices: devices.sort((a, b) => Date.parse(b.last_seen) - Date.parse(a.last_seen)),
		activityByDevice: Object.fromEntries(activity.map((a) => [a.device_id, a])),
		problem
	};
};
