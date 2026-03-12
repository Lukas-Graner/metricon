<script lang="ts">
    import { lerp } from "../utils/utils";

    interface Props {
        range?: [number, number];
        data: number[];
        kernelSigma?: number;
        resolution?: number;
    }

    let {
        range = [0, 1],
        data,
        kernelSigma = 0.1,
        resolution = 50
    }: Props = $props();
    
    const kernel = (t: number) =>
        Math.exp((-0.5 * t * t) / kernelSigma / kernelSigma) /
        Math.sqrt(2 * Math.PI) /
        kernelSigma;

    let kdePath = $derived.by(() => {
        const sums = [];
        let maxSum = 0;
        for (let i = 0; i < resolution; i++) {
            const p = lerp(...range, i / resolution);
            let sum = 0;
            for (let d of data) {
                sum += kernel(d - p);
            }
            sums.push(sum);
            maxSum = Math.max(maxSum, sum);
        }
        maxSum = Math.max(maxSum, data.length);
        // Path from (0,0) to (1,1) in the parent's coordinate system
        return sums.map((sum, i) => `${i==0 ? "M" : "L"} ${(i / resolution).toFixed(2)} ${(sum / maxSum).toFixed(2)}`).join(" ");
    });

</script>

<path d={kdePath} stroke="lightgray" fill="none" vector-effect="non-scaling-stroke" />