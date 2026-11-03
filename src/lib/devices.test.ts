import { describe, expect, it } from 'vitest';

import { barHeight, groupErrorsByDevice, tallestDay } from './devices';

describe('barHeight', () => {
	it('draws a day with no results as nothing', () => {
		expect(barHeight(0, 100)).toBe(0);
	});

	it('draws the tallest day full height', () => {
		expect(barHeight(100, 100)).toBe(100);
	});

	it('keeps a tiny non-zero day visible', () => {
		expect(barHeight(1, 10000)).toBe(2);
	});
});

describe('tallestDay', () => {
	it('is the largest daily count', () => {
		expect(
			tallestDay([
				{ date: '2026-11-01', results: 3 },
				{ date: '2026-11-02', results: 9 }
			])
		).toBe(9);
	});

	it('is zero when nothing was submitted', () => {
		expect(tallestDay([{ date: '2026-11-01', results: 0 }])).toBe(0);
	});
});

describe('groupErrorsByDevice', () => {
	const error = (id: number, name: string) => ({ id, device_display_name: name });

	it('groups by display name, ordered by each group newest error', () => {
		const groups = groupErrorsByDevice([
			error(5, 'Office'),
			error(4, 'blue-heron-2'),
			error(3, 'Office'),
			error(2, 'blue-heron-2')
		]);

		expect(groups.map((group) => group.name)).toEqual(['Office', 'blue-heron-2']);
		expect(groups[0].items.map((e) => e.id)).toEqual([5, 3]);
		expect(groups[1].items.map((e) => e.id)).toEqual([4, 2]);
	});

	it('gives no groups for no errors', () => {
		expect(groupErrorsByDevice([])).toEqual([]);
	});
});
