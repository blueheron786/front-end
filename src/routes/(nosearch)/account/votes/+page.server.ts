import { API_BASE as API } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const VOTES_PER_PAGE = 50;

type Vote = {
	url: string;
	query: string;
	vote_type: 'upvote' | 'downvote';
	timestamp: string;
};

export const actions: Actions = {
	deleteVote: async ({ request, cookies }) => {
		const data = await request.formData();
		const url = data.get('url');
		const query = data.get('query');

		if (typeof url !== 'string' || typeof query !== 'string') {
			return { success: false, error: 'A vote needs a URL and a query.' };
		}

		const res = await fetch(`${API}/api/v1/platform/search-results/vote`, {
			method: 'DELETE',
			headers: {
				Authorization: 'Bearer ' + cookies.get('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url, query })
		});

		// 404 means it was already deleted, say from another tab, which is what the user wanted.
		if (!res.ok && res.status !== 404) {
			return { success: false, error: 'Failed to delete the vote.' };
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

	const res = await fetch(
		`${API}/api/v1/platform/search-results/my-votes?limit=${VOTES_PER_PAGE}&offset=${(page - 1) * VOTES_PER_PAGE}`,
		{ headers: { Authorization: 'Bearer ' + cookies.get('accessToken') } }
	);
	const loaded = res.ok;
	const votes: { count: number; items: Vote[] } = loaded
		? await res.json()
		: { count: 0, items: [] };

	const pageCount = Math.max(1, Math.ceil(votes.count / VOTES_PER_PAGE));
	// Deleting the last vote on the final page leaves it empty, so go back to the new last page.
	if (loaded && page > pageCount) {
		throw redirect(302, `/account/votes?page=${pageCount}`);
	}

	return {
		loaded,
		votes: votes.items,
		voteCount: votes.count,
		page,
		pageCount
	};
};
