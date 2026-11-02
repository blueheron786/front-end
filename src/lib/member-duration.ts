/** Whole calendar months from `from` to `to`, in UTC so that the result doesn't depend on the viewer's timezone. */
export function wholeMonthsBetween(from: Date, to: Date): number {
	const months =
		(to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
	const reachedDayOfMonth =
		to.getUTCDate() > from.getUTCDate() ||
		(to.getUTCDate() === from.getUTCDate() &&
			to.getTime() % 86_400_000 >= from.getTime() % 86_400_000);
	return Math.max(0, reachedDayOfMonth ? months : months - 1);
}

function plural(count: number, unit: string): string {
	return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/** "2 years, 3 months", "1 year", "5 months" or "less than a month". */
export function describeMonths(totalMonths: number): string {
	const years = Math.floor(totalMonths / 12);
	const months = totalMonths % 12;
	if (years === 0 && months === 0) {
		return 'less than a month';
	}
	const parts = [];
	if (years > 0) {
		parts.push(plural(years, 'year'));
	}
	if (months > 0) {
		parts.push(plural(months, 'month'));
	}
	return parts.join(', ');
}
