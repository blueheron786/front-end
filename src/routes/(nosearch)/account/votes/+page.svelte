<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	import RiArrowUpSLine from '~icons/ri/arrow-up-s-line';
	import RiArrowDownSLine from '~icons/ri/arrow-down-s-line';
	import RiDeleteBin5Line from '~icons/ri/delete-bin-5-line';

	const { data, form } = $props();
</script>

<main class="flex w-full max-w-2xl flex-col gap-2 self-center px-6">
	<h2 class="-mx-2 text-3xl">My votes</h2>
	<p class="text-sm">
		<a href="/account" class="text-accent-text underline">Back to your account</a>
	</p>
	<hr class="my-2" />

	{#if form?.success === false && form?.error}
		<Card.Root role="alert" class="p-4 outline-red-100 outline-solid dark:outline-red-900">
			{form.error}
		</Card.Root>
	{/if}

	{#if !data.loaded}
		<Card.Root role="alert" class="p-4 outline-red-100 outline-solid dark:outline-red-900">
			Your votes couldn't be loaded. Try again in a moment.
		</Card.Root>
	{:else if data.votes.length > 0}
		<p class="text-sm">{data.voteCount.toLocaleString()} in all, newest first.</p>
		<ul class="mt-2 flex flex-col gap-4">
			{#each data.votes as vote (vote.url + '\n' + vote.query)}
				<li class="bg-muted flex flex-row items-center gap-2 p-4">
					<div class="bg-card text-accent-text flex aspect-square items-center p-2">
						{#if vote.vote_type === 'upvote'}
							<RiArrowUpSLine class="size-8" />
						{:else}
							<RiArrowDownSLine class="size-8" />
						{/if}
					</div>
					<div class="flex min-w-0 flex-col gap-1">
						<Button
							variant="link"
							class="h-fit justify-start py-0 font-medium break-all whitespace-normal"
							href={vote.url}
							target="_blank">{vote.url}</Button
						>
						<p class="px-4 break-words">for query: {vote.query}</p>
					</div>
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="destructive"
									size="icon"
									class="ml-auto size-9 shrink-0 hover:-rotate-20"
								>
									<RiDeleteBin5Line class="size-6" />
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Delete vote?</AlertDialog.Title>
								<AlertDialog.Description>
									This permanently removes your {vote.vote_type} for <code>{vote.url}</code> on
									query
									<code>{vote.query}</code>.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<form method="post" action="?/deleteVote">
									<input type="hidden" name="url" value={vote.url} />
									<input type="hidden" name="query" value={vote.query} />
									<AlertDialog.Action class="bg-red-600" type="submit"
										>Delete vote</AlertDialog.Action
									>
								</form>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</li>
			{/each}
		</ul>

		{#if data.pageCount > 1}
			<nav class="mt-2 flex items-center justify-between text-sm" aria-label="Vote pages">
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
		<p class="text-sm">No votes yet.</p>
	{/if}
</main>
