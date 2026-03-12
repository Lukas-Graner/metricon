<script lang="ts">
    import { settings } from "../utils/settings.svelte";
</script>

<div class="settings-content panel shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]! dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)]! m-4 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] pointer-events-auto flex flex-col">
    <div class="p-3 border-b border-gray-200 dark:border-slate-700 shrink-0">
        <h3 class="text-sm font-semibold control-label uppercase tracking-wider text-gray-500">Settings</h3>
    </div>
    <div class="p-3 overflow-y-auto flex-1">
        <div class="grid grid-cols-[0.8fr_auto] gap-x-4 gap-y-1">
            <!-- Row 1: Swap Truth/Prediction -->
            <label class="col-span-2 flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                    type="checkbox"
                    bind:checked={settings.confusionMatrixFlip}
                    class="w-3.5 h-3.5 rounded text-gray-900 border-gray-300 focus:ring-accent cursor-pointer"
                />
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200 select-none">Swap Truth/Prediction</span>
            </label>

            <!-- Row 2: Percentages -->
            <label class="col-span-2 flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                    type="checkbox"
                    bind:checked={settings.showMetricsAsPercentage}
                    class="w-3.5 h-3.5 rounded text-gray-900 border-gray-300 focus:ring-accent cursor-pointer"
                />
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200 select-none">Percentages</span>
            </label>

            <!-- Separator -->
            <div class="col-span-2 my-2 border-t border-gray-200 dark:border-slate-700"></div>

            <!-- Row 3: Table Sort -->
            <div class="flex items-center gap-2 py-1.5">
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Table Sort</span>
            </div>
            <div class="flex items-center gap-2 py-1.5">
                <select
                    bind:value={settings.tableSortType}
                    class="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
                >
                    <option value="default">Default</option>
                    <option value="bounded">Value (bounded) ↓</option>
                    <option value="bounded-descending">Value (bounded) ↑</option>
                    <option value="absolute">Value (absolute) ↓</option>
                    <option value="absolute-descending">Value (absolute) ↑</option>
                    <option value="name">Name ↑</option>
                    <option value="name-descending">Name ↓</option>
                </select>
            </div>

            <!-- Separator -->
            <div class="col-span-2 my-2 border-t border-gray-200 dark:border-slate-700"></div>

            <!-- Row 4: Detail Level -->
            <div class="flex items-center gap-2 py-1.5">
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Detail Level</span>
            </div>
            <div class="flex items-center gap-2 py-1.5">
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    bind:value={settings.metricVisibilityLevel}
                    class="w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <span class="text-xs text-gray-500 dark:text-gray-400 w-16 text-left">
                    {#if settings.metricVisibilityLevel === 1}
                        Basic
                    {:else if settings.metricVisibilityLevel === 2}
                        Advanced
                    {:else}
                        Expert
                    {/if}
                </span>
            </div>

            <!-- Separator -->
            <div class="col-span-2 my-2 border-t border-gray-200 dark:border-slate-700"></div>

            <!-- Row 5: Decimal Places -->
            <div class="flex items-center gap-2 py-1.5">
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Decimal Places</span>
            </div>
            <div class="flex items-center gap-2 py-1.5">
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    bind:value={settings.floatingPrecision}
                    class="w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <span class="text-xs text-gray-500 dark:text-gray-400 w-6 text-left">{settings.floatingPrecision}</span>
            </div>

            <!-- Separator -->
            <div class="col-span-2 my-2 border-t border-gray-200 dark:border-slate-700"></div>

            <!-- Row 6: Render Mode -->
            <div class="flex items-center gap-2 py-1.5">
                <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Render Mode</span>
            </div>
            <div class="flex items-center gap-2 py-1.5">
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    bind:value={settings.scatterplotRenderMode}
                    class="w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <span class="text-xs text-gray-500 dark:text-gray-400 w-20 text-left">
                    {#if settings.scatterplotRenderMode === 1}
                        Points
                    {:else if settings.scatterplotRenderMode === 2}
                        Points & Triangle
                    {:else}
                        Triangle
                    {/if}
                </span>
            </div>

        </div>
    </div>
</div>
