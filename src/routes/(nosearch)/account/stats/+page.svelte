<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { describeMonths, wholeMonthsBetween } from '$lib/member-duration';

	export let data;

	$: joined = data.dateJoined ? new Date(data.dateJoined) : null;
	$: signedUpAgo = joined ? describeMonths(wholeMonthsBetween(joined, new Date())) : null;

	let canvas: HTMLCanvasElement | undefined;
	let chart: { destroy: () => void } | undefined;
	let destroyed = false;

	// Chart.js takes its colours as options, so a theme change means rebuilding the chart.
	async function drawChart() {
		const { default: Chart } = await import('chart.js/auto');
		// The import is async, so the component may be gone before it resolves.
		if (destroyed || !canvas) return;

		const isDark = document.documentElement.classList.contains('dark');
		const textColor = isDark ? '#e5e7eb' : '#374151';
		const gridColor = isDark ? '#374151' : '#e5e7eb';

		chart?.destroy();
		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: data.chartLabels,
				datasets: [
					{
						label: 'Results indexed',
						data: data.chartData.indexed,
						backgroundColor: isDark ? 'rgba(37, 99, 235, 0.9)' : 'rgba(59, 130, 246, 0.9)',
						borderRadius: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (item) => `${Number(item.parsed.y).toLocaleString()} results`
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: textColor, maxTicksLimit: 8 }
					},
					y: {
						beginAtZero: true,
						ticks: {
							color: textColor,
							precision: 0,
							callback: (value) => Number(value).toLocaleString()
						},
						grid: { color: gridColor }
					}
				}
			}
		});
	}

	onMount(() => {
		drawChart();
		const observer = new MutationObserver(drawChart);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	onDestroy(() => {
		destroyed = true;
		chart?.destroy();
	});
</script>

<div class="min-h-screen">
	<header class="shadow-md">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<h1 class="text-3xl font-bold">{data.username}'s stats</h1>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div
			class="grid gap-6 sm:grid-cols-2 {data.supporterMonths ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}"
		>
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">Signed Up</h2>
				{#if joined}
					<p class="text-3xl font-bold">{signedUpAgo}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						ago, in {joined.getUTCFullYear()}
					</p>
				{:else}
					<p class="text-3xl font-bold">&mdash;</p>
				{/if}
			</div>
			{#if data.supporterMonths}
				<div class="bg-card rounded-lg p-6 shadow">
					<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">
						Paying Supporter
					</h2>
					<p class="text-3xl font-bold">{describeMonths(data.supporterMonths)}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						At any tier, adding up every spell you've supported Mwmbl
					</p>
				</div>
			{/if}
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">
					Total Results Indexed
				</h2>
				<p class="text-3xl font-bold">{data.totalIndexed.toLocaleString()}</p>
			</div>
			<div class="bg-card rounded-lg p-6 shadow">
				<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">Indexed Today</h2>
				<p class="text-3xl font-bold">{data.myIndexedToday.toLocaleString()}</p>
			</div>
		</div>

		<div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<div class="bg-brand-gradient rounded-lg p-[3px] shadow">
				<div class="bg-card h-full rounded-[5px] p-6">
					<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">Seed Searches</h2>
					<p class="text-3xl font-bold">{data.seedSearches.toLocaleString()}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Searches you made with <a href="/seed-search" class="underline">Seed Search</a> on, all time
					</p>
				</div>
			</div>
			<div class="bg-brand-gradient rounded-lg p-[3px] shadow">
				<div class="bg-card h-full rounded-[5px] p-6">
					<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">Seed Pages</h2>
					<p class="text-3xl font-bold">{data.seedCrawlPagesIndexed.toLocaleString()}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						New pages your Seed Searches added to the Mwmbl index, all time
					</p>
				</div>
			</div>
			<div class="bg-brand-gradient rounded-lg p-[3px] shadow">
				<div class="bg-card h-full rounded-[5px] p-6">
					<h2 class="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">New Sites Found</h2>
					<p class="text-3xl font-bold">{data.seedSitesDiscovered.toLocaleString()}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Sites your Seed Searches were the first to bring to Mwmbl, all time
					</p>
				</div>
			</div>
		</div>

		<div class="bg-card mt-8 rounded-lg p-6 shadow">
			<h2 class="mb-4 text-lg font-medium text-gray-500 dark:text-gray-400">
				Results Indexed Per Day (Last 30 Days)
			</h2>
			<div class="h-64 w-full" role="img" aria-label="Bar chart of results indexed per day">
				<canvas bind:this={canvas} class="h-full w-full"></canvas>
			</div>
		</div>
	</main>
</div>
