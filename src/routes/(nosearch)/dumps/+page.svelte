<script lang="ts">
	import RiDownloadLine from '~icons/ri/download-line';
	import * as Card from '@/components/ui/card';
	import { fileName, formatBytes, formatDuration, licenseLabel } from '$lib/dumps';

	let { data } = $props();

	const latest = $derived(data.dumps[0]);
	const duration = $derived(latest ? formatDuration(latest.started, latest.finished) : null);

	const numberFormat = new Intl.NumberFormat('en-GB');
	const dateFormat = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const shortDateFormat = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const timeFormat = new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC'
	});

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyChecksum(sha: string) {
		try {
			await navigator.clipboard.writeText(sha);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}

	function shortSha(sha: string) {
		return `${sha.slice(0, 8)}…${sha.slice(-6)}`;
	}
</script>

<svelte:head>
	<title>Index dumps - Mwmbl</title>
</svelte:head>

<main class="flex w-full max-w-5xl flex-col gap-10 self-center px-6 py-8">
	<section class="flex max-w-2xl flex-col gap-3">
		<p class="text-unemphasized-2 text-sm font-semibold tracking-wide uppercase">Open data</p>
		<h1 class="text-4xl font-bold tracking-tight">Index dumps</h1>
		<p class="text-unemphasized-2 text-lg">
			Mwmbl's search index is built by volunteers and belongs to everyone. Download a full snapshot
			to run your own copy of the index or study it.
		</p>
	</section>

	{#if data.error}
		<Card.Root class="p-4 outline-red-100 outline-solid dark:outline-red-900">
			{data.error}
		</Card.Root>
	{:else if !latest}
		<Card.Root class="p-4">No index dumps have been published yet.</Card.Root>
	{:else}
		<section aria-labelledby="latest">
			<Card.Root class="text-foreground gap-6 border p-5 sm:p-7">
				<div class="flex flex-wrap items-start justify-between gap-5">
					<div class="flex min-w-0 flex-col gap-1.5">
						<h2 id="latest" class="text-2xl font-bold">Latest dump</h2>
						<p class="text-unemphasized-2">
							Finished {dateFormat.format(new Date(latest.finished))}, {timeFormat.format(
								new Date(latest.finished)
							)} UTC{#if duration}&nbsp;· took {duration}{/if}
						</p>
						<p class="text-unemphasized-2 font-mono text-sm break-all">
							{latest.index_name} / {fileName(latest)}
						</p>
					</div>
					<div class="flex flex-wrap gap-2.5">
						<a
							href={latest.url}
							class="bg-brand-gradient inline-flex min-h-11 items-center gap-2 rounded-lg px-5 font-bold text-black transition-opacity hover:opacity-90"
						>
							<RiDownloadLine class="size-5" aria-hidden="true" />
							Download ({formatBytes(latest.compressed_size)})
						</a>
						<a
							href={latest.manifest_url}
							class="hover:bg-accent inline-flex min-h-11 items-center rounded-lg border px-4 font-semibold"
						>
							Manifest (JSON)
						</a>
					</div>
				</div>

				<dl
					class="bg-border grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4"
				>
					<div class="bg-card px-4 py-4">
						<dt class="text-unemphasized-2 text-sm">Index pages</dt>
						<dd class="mt-1 text-2xl font-bold tabular-nums">
							{numberFormat.format(latest.num_pages)}
						</dd>
					</div>
					<div class="bg-card px-4 py-4">
						<dt class="text-unemphasized-2 text-sm">Page size</dt>
						<dd class="mt-1 text-2xl font-bold tabular-nums">
							{numberFormat.format(latest.page_size)} B
						</dd>
					</div>
					<div class="bg-card px-4 py-4">
						<dt class="text-unemphasized-2 text-sm">Compressed</dt>
						<dd class="mt-1 text-2xl font-bold tabular-nums">
							{formatBytes(latest.compressed_size)}
						</dd>
					</div>
					<div class="bg-card px-4 py-4">
						<dt class="text-unemphasized-2 text-sm">Uncompressed</dt>
						<dd class="mt-1 text-2xl font-bold tabular-nums">{formatBytes(latest.size)}</dd>
					</div>
				</dl>

				<div class="flex flex-col gap-2">
					<label for="sha" class="text-unemphasized-2 text-sm">SHA-256 checksum</label>
					<div class="flex flex-wrap gap-2">
						<input
							id="sha"
							readonly
							value={latest.sha256}
							onfocus={(e) => e.currentTarget.select()}
							class="bg-background min-h-11 min-w-0 flex-[1_1_22rem] rounded-lg border px-3 font-mono text-sm"
						/>
						<button
							type="button"
							onclick={() => copyChecksum(latest.sha256)}
							class="bg-card hover:bg-accent min-h-11 rounded-lg border px-4 font-semibold hover:cursor-pointer"
						>
							{copied ? 'Copied' : 'Copy'}
						</button>
					</div>
				</div>

				<p class="text-unemphasized-2 text-sm">
					Licensed under
					<a
						href={latest.license_url}
						class="text-foreground font-semibold underline underline-offset-4"
						>{licenseLabel(latest.license)}</a
					>
				</p>
			</Card.Root>
		</section>

		<section class="flex flex-col gap-4" aria-labelledby="all">
			<h2 id="all" class="text-2xl font-bold">All dumps</h2>
			<div class="bg-card relative overflow-x-auto rounded-xl border">
				<table class="w-full min-w-[52rem] border-collapse tabular-nums">
					<thead>
						<tr class="text-unemphasized-2 text-left text-sm">
							<th scope="col" class="border-b px-5 py-3.5 font-semibold">Finished</th>
							<th scope="col" class="border-b px-5 py-3.5 font-semibold">Index</th>
							<th scope="col" class="border-b px-5 py-3.5 text-right font-semibold">Index pages</th>
							<th scope="col" class="border-b px-5 py-3.5 text-right font-semibold">Compressed</th>
							<th scope="col" class="border-b px-5 py-3.5 font-semibold">SHA-256</th>
							<th scope="col" class="border-b px-5 py-3.5"><span class="sr-only">Links</span></th>
						</tr>
					</thead>
					<tbody>
						{#each data.dumps as dump (dump.key)}
							<tr class="[&:last-child>td]:border-b-0">
								<td class="border-b px-5 py-3.5 font-semibold whitespace-nowrap">
									{shortDateFormat.format(new Date(dump.finished))}
								</td>
								<td class="border-b px-5 py-3.5 font-mono text-sm whitespace-nowrap"
									>{dump.index_name}</td
								>
								<td class="border-b px-5 py-3.5 text-right">
									{numberFormat.format(dump.num_pages)}
								</td>
								<td class="border-b px-5 py-3.5 text-right whitespace-nowrap">
									{formatBytes(dump.compressed_size)}
								</td>
								<td
									class="text-unemphasized-2 border-b px-5 py-3.5 font-mono text-sm"
									title={dump.sha256}
								>
									{shortSha(dump.sha256)}
								</td>
								<td class="border-b px-3 py-1.5 text-right whitespace-nowrap">
									<a
										href={dump.manifest_url}
										class="text-unemphasized-2 hover:text-foreground inline-flex min-h-11 items-center px-2.5 font-semibold"
										aria-label="Manifest for the dump finished {shortDateFormat.format(
											new Date(dump.finished)
										)}">Manifest</a
									>
									<a
										href={dump.url}
										class="inline-flex min-h-11 items-center gap-1.5 px-2.5 font-semibold hover:opacity-75"
										aria-label="Download the dump finished {shortDateFormat.format(
											new Date(dump.finished)
										)}"
									>
										<RiDownloadLine class="size-4" aria-hidden="true" />
										Download
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="grid grid-cols-1 gap-6 md:grid-cols-2" aria-labelledby="using">
			<div class="flex flex-col gap-3">
				<h2 id="using" class="text-2xl font-bold">Using a dump</h2>
				<p class="text-unemphasized-2">
					Each dump is a single Zstandard-compressed copy of the index file, made of fixed-size
					{numberFormat.format(latest.page_size)}-byte pages. Check the SHA-256, then decompress it.
					The manifest JSON holds the same details as this page.
				</p>
				<p class="text-unemphasized-2">
					You'll need about {formatBytes(latest.size)} free for the decompressed index.
				</p>
			</div>
			<pre
				class="min-w-0 overflow-x-auto rounded-xl border bg-[#111214] p-5 font-mono text-sm leading-relaxed text-[#E8EAED]"><span
					class="text-[#9AA0A6]"># download</span
				>
curl -LO {latest.url}

<span class="text-[#9AA0A6]"># verify</span>
echo "{latest.sha256}  {fileName(latest)}" | sha256sum -c

<span class="text-[#9AA0A6]"># decompress</span>
zstd -d {fileName(latest)} -o {latest.index_name}</pre>
		</section>
	{/if}
</main>
