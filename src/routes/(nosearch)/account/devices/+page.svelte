<script lang="ts">
	import * as Card from '@/components/ui/card';
	import { deviceName } from '$lib/devices';

	const { data } = $props();
</script>

<main class="flex w-full max-w-4xl flex-col gap-2 self-center px-6">
	<h2 class="-mx-2 text-3xl">Devices</h2>
	<p class="text-sm">
		<a href="/account" class="text-accent-text underline">Back to your account</a>
	</p>
	<hr class="my-2" />

	{#if data.problem}
		<Card.Root role="alert" class="p-4 outline-red-100 outline-solid dark:outline-red-900">
			{#if data.problem === 'unverified'}
				Devices need a verified email address. Verify yours on your account page, then come back.
			{:else}
				Your devices could not be loaded. Try again shortly.
			{/if}
		</Card.Root>
	{:else if data.devices.length === 0}
		<p class="text-sm">No devices yet. A device appears once a crawler submits results.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full min-w-[40rem] border-collapse text-left tabular-nums">
				<thead class="bg-muted">
					<tr>
						<th class="px-4 py-3">Device name</th>
						<th class="px-4 py-3">Version</th>
						<th class="px-4 py-3">Last seen</th>
						<th class="px-4 py-3 text-right">Last 24 hours</th>
						<th class="px-4 py-3 text-right">Results indexed</th>
					</tr>
				</thead>
				<tbody>
					{#each data.devices as device (device.id)}
						{@const activity = data.activityByDevice[device.id]}
						<tr class="border-b">
							<td class="px-4 py-3 break-all">
								<a href={`/account/devices/${device.id}`} class="text-accent-text underline">
									{deviceName(device)}
								</a>
							</td>
							<td class="px-4 py-3">{device.crawler_version ?? '–'}</td>
							<td class="px-4 py-3">{new Date(device.last_seen).toLocaleString()}</td>
							<td class="px-4 py-3 text-right">
								{activity ? activity.results_last_24h.toLocaleString() : '–'}
							</td>
							<td class="px-4 py-3 text-right">
								{activity ? activity.results_total.toLocaleString() : '–'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="text-xs">
			Counted from when this feature was added; earlier results are not included.
		</p>
	{/if}
</main>
