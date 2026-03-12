<script>
    import DidYouKnowCard from "./DidYouKnowCard.svelte";
    import ConfusionMatrix from "../components/ConfusionMatrix.svelte";
    import DataTable from "../components/DataTable.svelte";
    import { confusionmatrixmetrics } from "../utils/metrics";
    import { formatMetricValue } from "../utils/utils";
    import InteractivePanel from "../components/InteractivePanel.svelte";

    export const title = "Negative Cohens Kappa";
    let classRatio = $state(0.5);
    const numInstances = 100;
    let matrix = $derived([[0, Math.round(numInstances*classRatio)], [numInstances-Math.round(numInstances*classRatio), 0]]);
    let kappaValue = $derived(confusionmatrixmetrics.kappa.calc(matrix));
</script>

<DidYouKnowCard
    title="Cohen's Kappa bounds depend on class ratio"
    icon="𝛫"
>
    <p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4 text-justify">
        Did you know that when a classifier predicts everything incorrectly, Cohen's Kappa can still be greater than −1? The minimum value of −1 is only achievable on a balanced dataset.
        <br/>
    </p>
    <div class="flex justify-center mb-4">
        <InteractivePanel variant="compact">
            <div class="flex items-center gap-1">
                <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(1 - classRatio, true, 2)}</span>
                <span class="text-xs font-medium text-rose-600 dark:text-rose-400">Negatives</span>
                <input type="range" min={0} max={1} step={0.01} bind:value={classRatio} class="mx-3 w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"/>
                <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(classRatio, true, 2)}</span>
                <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Positives</span>
            </div>
        </InteractivePanel>
    </div>
    <div class="flex flex-col items-center">
        <div class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Wrong-Only Predictor</div>
        <div class="flex flex-col items-center gap-4">
            <ConfusionMatrix matrix={matrix}/>
            <div class="panel rounded-lg overflow-hidden w-full">
                <DataTable
                    metrics={[{
                        id: "cohens-kappa",
                        displayName: "Cohen's Kappa",
                        bounds: [-1, 1],
                        value: kappaValue,
                    }]}
                />
            </div>
        </div>
    </div>
</DidYouKnowCard>
