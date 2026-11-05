import { describe, expect, it } from 'vitest';

import { deviceName, errorsForDevice, loadProblem } from './devices';

describe('loadProblem', () => {
	it('blames the email address only when the API refuses the account', () => {
		expect(loadProblem(403)).toBe('unverified');
		expect(loadProblem(404)).toBe('unavailable');
		expect(loadProblem(500)).toBe('unavailable');
	});
});

describe('deviceName', () => {
	it('prefers the friendly name', () => {
		expect(deviceName({ hostname: 'blue-heron-2', friendly_name: 'Office' })).toBe('Office');
	});

	it('falls back to the hostname', () => {
		expect(deviceName({ hostname: 'blue-heron-2', friendly_name: null })).toBe('blue-heron-2');
	});
});

describe('errorsForDevice', () => {
	it('keeps only the errors reported under the device hostname, in order', () => {
		const errors = [
			{ id: 3, device_name: 'blue-heron-2' },
			{ id: 2, device_name: 'other' },
			{ id: 1, device_name: 'blue-heron-2' }
		];

		expect(errorsForDevice(errors, { hostname: 'blue-heron-2' }).map((e) => e.id)).toEqual([3, 1]);
	});
});
