<script>
    let { title, icon, children } = $props();

    let expanded = $state(false);
</script>

<div
    class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden {expanded
        ? 'shadow-lg shadow-gray-400/10 dark:shadow-gray-900/50'
        : ''} hover:shadow-lg hover:shadow-gray-400/10 dark:hover:shadow-gray-900/50"
>
    <div
        class="flex items-center gap-3 p-4 cursor-pointer select-none {expanded
            ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
        onclick={() => (expanded = !expanded)}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") expanded = !expanded;
        }}
        role="button"
        tabindex="0"
    >
        <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-semibold bg-linear-to-br from-accent/10 to-accent/5 text-accent dark:from-accent/20 dark:to-accent/10 dark:text-accent"
        >
            {icon}
        </div>
        <div class="flex-1">
            <h2
                class="text-lg font-semibold text-gray-900 dark:text-gray-100 my-0!"
            >
                {title}
            </h2>
        </div>
        <div class="w-6 h-6 {expanded ? 'rotate-180' : ''}">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><polyline points="6 9 12 15 18 9" /></svg
            >
        </div>
    </div>

    {#if expanded}
        <div class="px-6 py-4 overflow-hidden">
            {@render children()}
        </div>
    {/if}
</div>
