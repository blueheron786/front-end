import { describe, expect, it } from 'vitest';

import { describeMonths, wholeMonthsBetween } from './member-duration';

describe('wholeMonthsBetween', () => {
	it('counts a month once its day of the month has been reached', () => {
		const joined = new Date('2024-01-15T10:00:00Z');

		expect(wholeMonthsBetween(joined, new Date('2024-02-14T10:00:00Z'))).toBe(0);
		expect(wholeMonthsBetween(joined, new Date('2024-02-15T10:00:00Z'))).toBe(1);
		expect(wholeMonthsBetween(joined, new Date('2024-02-15T09:59:00Z'))).toBe(0);
	});

	it('spans years', () => {
		expect(
			wholeMonthsBetween(new Date('2022-11-01T00:00:00Z'), new Date('2026-01-20T00:00:00Z'))
		).toBe(38);
	});

	it('is never negative', () => {
		expect(
			wholeMonthsBetween(new Date('2026-05-01T00:00:00Z'), new Date('2026-04-01T00:00:00Z'))
		).toBe(0);
	});
});

describe('describeMonths', () => {
	it('uses years and months, singular and plural', () => {
		expect(describeMonths(38)).toBe('3 years, 2 months');
		expect(describeMonths(13)).toBe('1 year, 1 month');
	});

	it('leaves out a zero part', () => {
		expect(describeMonths(24)).toBe('2 years');
		expect(describeMonths(5)).toBe('5 months');
		expect(describeMonths(1)).toBe('1 month');
	});

	it('says so when it is under a month', () => {
		expect(describeMonths(0)).toBe('less than a month');
	});
});
