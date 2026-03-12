<script lang="ts">
    import "katex/dist/katex.min.css";
    import ConfusionMatrixTab from "./pages/ConfusionMatrixPage.svelte";
    import DidYouKnowTab from "./pages/DidYouKnowPage.svelte";
    import MetricVsMetricTab from "./pages/MetricVsMetricPage.svelte";
    import { settings } from "./utils/settings.svelte"
    import SettingsPanel from "./components/SettingsPanel.svelte";
    import { onMount } from "svelte";
    import { router, handleNavigation, getHref, initRouter } from "./router.svelte";

    const routes = {
        "confusion-matrix": { name: "Confusion Matrix", component: ConfusionMatrixTab },
        "metric-vs-metric": { name: "Metric vs. Metric", component: MetricVsMetricTab },
        "did-you-know": { name: "Did You Know?", component: DidYouKnowTab },
    };

    let settingsOpen = $state(false);
    

    onMount(() => {
        return initRouter(routes);
    });

    function closeSettingsOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.settings-content') && !target.closest('.settings-trigger')) {
            settingsOpen = false;
        }
    }

    function toggleSettings() {
        settingsOpen = !settingsOpen;
    }
</script>

<svelte:window onclick={closeSettingsOutside} />

<div class:dark={settings.darkMode} class="min-h-screen flex flex-col font-sans overflow-x-hidden">
    <!-- Top Navigation Header -->
    <header class="app-header px-4 lg:px-6 h-14 sticky top-0 z-40">
        <div class="flex items-center">
            <div class="flex items-center gap-2">
                <img src="/logo.webp" alt="Logo" class="h-6 w-auto shrink-0" />
                <h1 class="m-0 leading-none">Metricon</h1>
            </div>

            <!-- Desktop Nav -->
            <nav class="flex items-center space-x-1 ml-8 border-l border-gray-200 dark:border-slate-700 pl-4 h-8">
                {#each Object.keys(routes) as route (route)}
                    {@const config = routes[route as keyof typeof routes]}
                    <a
                        href={getHref(route)}
                        onclick={(e) => handleNavigation(e, route)}
                        class="px-3 py-1.5 text-sm font-medium rounded
                        {router.currentRoute === route
                            ? 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'}"
                    >
                        {config.name}
                    </a>
                {/each}
            </nav>
        </div>

        <div class="flex items-center gap-2">
            <!-- Theme Toggle -->
            <button
                class="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                onclick={() => settings.darkMode = !settings.darkMode}
                title="Toggle Theme"
            >
                {#if settings.darkMode}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                {/if}
            </button>

            <!-- Settings Toggle -->
            <button
                class="settings-trigger w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                onclick={toggleSettings}
                title="Settings"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            <a
                target="_blank" 
                rel="noopener noreferrer"
                href="https://github.com/Lukas-Graner/metricon"
                class="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                title="View on GitHub"
            >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
            </a>
            
        </div>
    </header>

    <!-- Settings Panel Container -->
    {#if settingsOpen}
    <div class="fixed top-14 right-0 bottom-0 z-50 pointer-events-none w-full max-w-sm flex justify-end">
        <div class="pointer-events-auto w-full h-full transform">
            <SettingsPanel/>
        </div>
    </div>
    {/if}

    <!-- Main Content Area - Max width constraints removed for data plots! -->
    <main class="flex-1 w-full relative">
        {#each Object.entries(routes) as [route, config] (route)}
            {@const SvelteComponent = config.component}
            <div class="w-full h-full" class:hidden={route !== router.currentRoute}>
                <SvelteComponent />
            </div>
        {/each}
    </main>
</div>
