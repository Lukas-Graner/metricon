<script lang="ts">
    import type { Snippet } from "svelte";
    import InteractiveIcon from "./InteractiveIcon.svelte";

    interface Props {
        variant?: "full" | "compact";
        title?: string;
        children: Snippet;
    }

    let { variant = "compact", title = "", children }: Props = $props();
</script>

{#if variant === "full"}
    <div class="interactive-panel rounded-lg overflow-hidden w-fit max-w-full shrink-0 mt-4">
        <div class="bg-blue-50/50 dark:bg-slate-800/50 px-5 py-3 border-b border-blue-200/30 dark:border-slate-700/50 relative">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">{title}</h3>
            <div class="absolute right-4 top-1/2 -translate-y-1/2">
                <InteractiveIcon />
            </div>
        </div>
        <div class="px-5 py-4">
            {@render children()}
        </div>
    </div>
{:else}
    <div class="interactive-panel rounded-lg overflow-hidden w-fit max-w-full flex">
        <div class="mx-3 my-auto">
            {@render children()}
        </div>
        <div class="bg-blue-50/50 dark:bg-slate-800/50 px-3 py-2 flex items-center border-r border-blue-200/30 dark:border-slate-700/50">
            <InteractiveIcon />
        </div>
    </div>
{/if}
