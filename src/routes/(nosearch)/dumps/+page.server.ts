import type { PageServerLoad } from './$types';
import { API_BASE } from '$lib/api';
import { parseDumps } from '$lib/dumps';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${API_BASE}/api/v1/search/dumps`);
		if (!res.ok) {
			return { dumps: [], error: `Could not load the index dumps (${res.status}).` };
		}
		const dumps = parseDumps(await res.json());
		if (!dumps) {
			return { dumps: [], error: 'The index dumps came back in an unexpected format.' };
		}
		return { dumps, error: null };
	} catch (err) {
		console.error('Error fetching index dumps:', err);
		return { dumps: [], error: 'Could not load the index dumps.' };
	}
};
