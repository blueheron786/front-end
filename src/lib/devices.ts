export type DayResults = { date: string; results: number };

/** A day's bar as a percentage of the tallest day; a day with results is never drawn as nothing. */
export function barHeight(results: number, tallest: number): number {
	if (results === 0) return 0;
	return Math.max(2, Math.round((results / tallest) * 100));
}

export function tallestDay(daily: DayResults[]): number {
	return Math.max(...daily.map((day) => day.results));
}

/** Groups by display name, in order of each group's first (newest) error. */
export function groupErrorsByDevice<T extends { device_display_name: string }>(
	errors: T[]
): { name: string; items: T[] }[] {
	const groups = new Map<string, T[]>();
	for (const error of errors) {
		const items = groups.get(error.device_display_name);
		if (items) {
			items.push(error);
		} else {
			groups.set(error.device_display_name, [error]);
		}
	}
	return [...groups].map(([name, items]) => ({ name, items }));
}
