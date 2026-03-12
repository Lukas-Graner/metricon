<script lang="ts">
    import colormaps from "../utils/colormaps";

    let { colormap = $bindable(colormaps.GreenBlueRed), id = "" } = $props();
    const numSteps = 5;

    let colormapSteps = $derived(Array.from({ length: numSteps + 1 }, (_, i) => colormap.calc(i / numSteps) + " " + (i / numSteps * 100).toFixed() + "%").join())
</script>

<div class="flex items-center w-full gap-2">
    <select {id} bind:value={colormap} class="sharp-input py-1! flex-1">
        {#each Object.values(colormaps) as c (c.id)}
            <option value={c}>{c.displayName}</option>
        {/each}
    </select>
    <div class="h-6 w-12 rounded-sm shrink-0 border border-gray-300 dark:border-slate-600 shadow-sm" style="background: linear-gradient(to right, {colormapSteps});"></div>
</div>
