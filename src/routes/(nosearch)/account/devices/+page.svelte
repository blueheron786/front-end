<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	const { data, form } = $props();
</script>

<main class="flex w-full max-w-2xl flex-col gap-2 self-center px-6">
	<h2 class="-mx-2 text-3xl">Devices</h2>
	<p class="text-sm">
		<a href="/account" class="text-accent-text underline">Back to your account</a>
	</p>
	<hr class="my-2" />

	{#if form?.success === false && form?.error}
		<Card.Root role="alert" class="p-4 outline-red-100 outline-solid dark:outline-red-900">
			{form.error}
		</Card.Root>
	{/if}

	{#if data.devices.length > 0}
		<ul class="flex flex-col gap-2">
			{#each data.devices as device (device.id)}
				<li class="bg-muted flex flex-row items-center gap-2 p-4">
					<div class="flex flex-1 flex-col gap-1">
						<span class="font-medium">{device.friendly_name ?? device.hostname}</span>
						<span class="text-xs">Hostname: {device.hostname}</span>
						<span class="text-xs">
							First seen: {new Date(device.first_seen).toLocaleString()}
						</span>
						<span class="text-xs">
							Last seen: {new Date(device.last_seen).toLocaleString()}
						</span>
					</div>
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon"
									class="ml-auto size-9"
									aria-label="Rename device"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
										/>
									</svg>
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<form method="post" action="?/updateDevice">
								<input type="hidden" name="deviceId" value={device.id} />
								<AlertDialog.Header>
									<AlertDialog.Title>Rename Device</AlertDialog.Title>
									<AlertDialog.Description>
										Give this device a friendly name (e.g., "My Laptop", "Work PC")
									</AlertDialog.Description>
								</AlertDialog.Header>
								<div class="px-6 pb-2">
									<Label for={`device-name-${device.id}`}>Device name</Label>
									<Input
										id={`device-name-${device.id}`}
										name="deviceName"
										type="text"
										placeholder="e.g. My Laptop"
										defaultValue={device.friendly_name ?? ''}
										class="mt-1"
									/>
								</div>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action type="submit">Save name</AlertDialog.Action>
								</AlertDialog.Footer>
							</form>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm">No devices yet. A device appears once a crawler submits results.</p>
	{/if}

	<hr class="my-4" />

	<h3 class="text-xl">Recent crawler errors</h3>
	<p class="text-sm">
		Errors your crawlers hit and recovered from, newest first. Each distinct error is reported at
		most once an hour per crawler.
	</p>

	{#if data.errors.length > 0}
		<ul class="mt-2 flex flex-col gap-2">
			{#each data.errors as error (error.id)}
				<li class="bg-muted flex flex-col gap-1 p-4">
					<span class="font-medium break-all">{error.exception_type}</span>
					<span class="font-mono text-sm break-words whitespace-pre-wrap">{error.message}</span>
					<span class="font-mono text-xs break-all">{error.location}</span>
					<span class="text-xs">
						{new Date(error.created_at).toLocaleString()} · {error.device_name} · {error.context} · crawler
						{error.crawler_version}
					</span>
				</li>
			{/each}
		</ul>

		{#if data.pageCount > 1}
			<nav class="mt-2 flex items-center justify-between text-sm" aria-label="Error pages">
				{#if data.page > 1}
					<a href={`?page=${data.page - 1}`} class="text-accent-text underline">Newer</a>
				{:else}
					<span></span>
				{/if}
				<span>Page {data.page} of {data.pageCount}</span>
				{#if data.page < data.pageCount}
					<a href={`?page=${data.page + 1}`} class="text-accent-text underline">Older</a>
				{:else}
					<span></span>
				{/if}
			</nav>
		{/if}
	{:else}
		<p class="text-sm">No errors reported.</p>
	{/if}
</main>
