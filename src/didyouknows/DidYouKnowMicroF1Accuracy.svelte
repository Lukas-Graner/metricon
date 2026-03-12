<script>
    import DidYouKnowCard from "./DidYouKnowCard.svelte";
    import ConfusionMatrix from "../components/ConfusionMatrix.svelte";
    import Tex from "../components/Tex.svelte";
    import DataTable from "../components/DataTable.svelte";
    import { confusionmatrixmetrics } from "../utils/metrics";

    export const title = "Micro F1 = Accuracy";

    function randomizeMatrix() {
        return [
            [Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)],
            [Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)]
        ];
    }

    let matrix = $state(randomizeMatrix());
    let accuracy = $derived(confusionmatrixmetrics.accuracy.calc(matrix));
    let microF1 = $derived(confusionmatrixmetrics.micro_f1score.calc(matrix));

    function reroll() {
        matrix = randomizeMatrix();
    }
</script>

<DidYouKnowCard
    title="Micro F1 equals Accuracy (for balanced datasets)"
    icon="🟰"
>
    <p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4 text-justify">
        Did you know that for binary classification, the <strong>Micro F1-Score</strong> is mathematically equivalent to <strong>Accuracy</strong>?
        <button
            onclick={reroll}
            class="px-2 rounded-lg bg-accent/10 hover:bg-accent/20 dark:bg-accent/20 dark:hover:bg-accent/30 text-accent"
            title="Randomize matrix"
        >🎲 Randomize</button> the confusion matrix to see that both metrics always produce identical values:
    </p>
    
    <div class="flex flex-row items-center justify-center gap-6 flex-wrap">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm">
            <Tex math={`\\begin{aligned}
\\text{F1}_{\\text{micro}}
&= \\frac{2\\text{P}_{\\text{micro}}\\text{R}_{\\text{micro}}}{\\text{P}_{\\text{micro}}+\\text{R}_{\\text{micro}}} = \\frac{2
\\left(\\frac{\\sum_k \\text{TP}_k}{\\sum_k(\\text{TP}_k+\\text{FP}_k)}\\right)
\\left(\\frac{\\sum_k \\text{TP}_k}{\\sum_k(\\text{TP}_k+\\text{FN}_k)}\\right)}
{
\\left(\\frac{\\sum_k \\text{TP}_k}{\\sum_k(\\text{TP}_k+\\text{FP}_k)}\\right)
+
\\left(\\frac{\\sum_k \\text{TP}_k}{\\sum_k(\\text{TP}_k+\\text{FN}_k)}\\right)
} \\\\[20pt]
&= \\frac{2
\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)
\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)}
{
\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)
+
\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)
} = \\frac{2\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)^2}
{2\\left(\\frac{\\sum_k \\text{TP}_k}{\\text{N}}\\right)} = \\frac{\\sum_k \\text{TP}_k}{\\text{N}} \\\\[20pt]
&= \\text{Accuracy}
\\end{aligned}`}/>
        </div>
        <div class="flex flex-col items-center gap-4">
            <ConfusionMatrix matrix={matrix}/>
            <div class="panel rounded-lg overflow-hidden">
                <DataTable
                    metrics={[
                        {
                            id: "accuracy",
                            displayName: "Accuracy",
                            bounds: [0, 1],
                            value: accuracy,
                        },
                        {
                            id: "micro-f1",
                            displayName: "Micro F1",
                            bounds: [0, 1],
                            value: microF1,
                        }
                    ]}
                />
            </div>
        </div>
    </div>
</DidYouKnowCard>
