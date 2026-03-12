<script lang="ts">
    import DraggableInput from "./DraggableInput.svelte";
    import { matrixTotalSum, calcConfusionMatrixCellStyle } from "../utils/utils";
    import { mouseDirectedDrag } from "../utils/mouseDrag";
    import {settings } from "../utils/settings.svelte"
    
    interface Props {
        classNames?: string[];
        matrix?: number[][];
        mutable?: boolean;
    }

    let {
        classNames = $bindable(["Positive", "Negative"]),
        matrix = $bindable([
            [10, 0],
            [0, 10],
        ]),
        mutable = false,
    }: Props = $props();

    let totalSum = $derived(matrixTotalSum(matrix));

    const moveBetweenCell = (
        iFrom: number,
        jFrom: number,
        iTo: number,
        jTo: number,
        value: number,
    ) => {
        if (settings.confusionMatrixFlip) {
            //[iFrom, jFrom] = [jFrom, iFrom]
            [iTo, jTo] = [jTo, iTo];
        }
        if (
            matrix[iFrom][jFrom] - value >= 0 &&
            matrix[iTo][jTo] + value >= 0
        ) {
            matrix[iFrom][jFrom] -= value;
            matrix[iTo][jTo] += value;
            matrix = matrix;
        }
    };
</script>

<div class="grid auto-cols-max auto-rows-max justify-center gap-1 min-w-fit">
    <div
        class="text-center text-gray-500 text-sm"
        style="grid-area: 1/3/auto/5;"
    >
        {settings.confusionMatrixFlip ? "Truth" : "Prediction"}
    </div>
    <div
        class="text-center text-gray-500 text-sm"
        style="grid-area: 3/1/5/auto;writing-mode:tb-rl;transform:rotate(-180deg)"
    >
        {settings.confusionMatrixFlip ? "Prediction" : "Truth"}
    </div>
    {#each classNames as cls, i (cls)}
        <div
            class="text-center"
            style="grid-area: {i + 3}/2;writing-mode:tb-rl;transform:rotate(-180deg)"
        >
            {cls}
        </div>
        <div class="text-center" style="grid-area: 2/{i + 3}">{cls}</div>
        {#each classNames as clsName, j (clsName)}
            {#if mutable}
                <div 
                    class="relative tooltip-container group"
                    style="grid-area: {(settings.confusionMatrixFlip ? j : i) + 3}/{(settings.confusionMatrixFlip ? i : j) + 3};"
                >
                    <DraggableInput
                        classs="rounded-sm border-gray-400 border w-32 h-32 text-center text-3xl font-mono shadow-none"
                        style={calcConfusionMatrixCellStyle(matrix[i][j], totalSum, i == j)}
                        bind:value={matrix[i][j]}
                    ></DraggableInput>
                </div>
            {:else}
                <div 
                    class="relative tooltip-container group flex"
                    style="grid-area: {(settings.confusionMatrixFlip ? j : i) + 3}/{(settings.confusionMatrixFlip ? i : j) + 3};"
                >
                    <div
                        class="rounded-sm border-gray-400 border w-full h-full text-xl font-mono flex shadow-none"
                        style="{calcConfusionMatrixCellStyle(matrix[i][j], totalSum, i == j)}"
                    >
                        <span class="m-auto">{matrix[i][j]}</span>
                    </div>
                </div>
            {/if}
        {/each}
    {/each}
    {#if mutable && classNames.length === 2}
        <div
            use:mouseDirectedDrag={"right"}
            onmousedirecteddragstep={(e: CustomEvent<{value: number}>) =>
                moveBetweenCell(0, 0, 0, 1, e.detail.value)}
            class="row-start-3 col-start-3 col-end-5 m-auto select-none cursor-e-resize text-3xl opacity-50"
        >
            ⬌
        </div>
        <div
            use:mouseDirectedDrag={"up"}
            onmousedirecteddragstep={(e: CustomEvent<{value: number}>) =>
                moveBetweenCell(0, 0, 1, 0, e.detail.value)}
            class="row-start-3 row-end-5 col-start-3 m-auto select-none cursor-n-resize text-3xl opacity-50"
        >
            ⬍
        </div>
        <div
            use:mouseDirectedDrag={"left"}
            onmousedirecteddragstep={(e: CustomEvent<{value: number}>) =>
                moveBetweenCell(1, 1, 1, 0, e.detail.value)}
            class="row-start-4 col-start-3 col-end-5 m-auto select-none cursor-e-resize text-3xl opacity-50"
        >
            ⬌
        </div>
        <div
            use:mouseDirectedDrag={"down"}
            onmousedirecteddragstep={(e: CustomEvent<{value: number}>) =>
                moveBetweenCell(1, 1, 0, 1, e.detail.value)}
            class="row-start-3 row-end-5 col-start-4 m-auto select-none cursor-n-resize text-3xl opacity-50"
        >
            ⬍
        </div>
    {/if}
</div>
