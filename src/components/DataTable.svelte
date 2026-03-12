<script lang="ts">
  import { flip } from "svelte/animate";
  import Tex from "./Tex.svelte";
  import FlashSpan from "./FlashSpan.svelte";
  import { formatMetricValue, invlerp } from "../utils/utils";

  interface MetricData {
    id: string;
    displayName: string;
    formula?: string;
    description?: string;
    bounds: [number, number];
    value: number;
  }

  type SortType = "default" | "bounded" | "bounded-descending" | "absolute" | "absolute-descending" | "name" | "name-descending";

  interface Props {
    metrics: MetricData[];
    floatingPrecision?: number;
    showMetricsAsPercentage?: boolean;
    showBar?: boolean;
    title?: string;
    compact?: boolean;
    sortType?: SortType;
  }

  let { metrics, floatingPrecision = 3, showMetricsAsPercentage = false, showBar = true, title, compact = false, sortType = "default" }: Props = $props();

  const sortedMetrics = $derived.by(() => {
    const sorted = [...metrics];
    switch (sortType) {
      case "name":
        sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "name-descending":
        sorted.sort((a, b) => b.displayName.localeCompare(a.displayName));
        break;
      case "absolute":
        sorted.sort((a, b) => a.value - b.value);
        break;
      case "absolute-descending":
        sorted.sort((a, b) => b.value - a.value);
        break;
      case "bounded":
        sorted.sort((a, b) => {
          const aNormalized = invlerp(a.bounds[0], a.bounds[1], a.value);
          const bNormalized = invlerp(b.bounds[0], b.bounds[1], b.value);
          return aNormalized - bNormalized;
        });
        break;
      case "bounded-descending":
        sorted.sort((a, b) => {
          const aNormalized = invlerp(a.bounds[0], a.bounds[1], a.value);
          const bNormalized = invlerp(b.bounds[0], b.bounds[1], b.value);
          return bNormalized - aNormalized;
        });
        break;
      default:
        // default - keep original order
        break;
    }
    return sorted;
  });
</script>

{#if !compact && title}
  <div class="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
    <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">{title}</h3>
  </div>
{/if}
<table class="w-full {compact ? 'text-xs' : 'text-sm'} text-left text-slate-600 dark:text-slate-400">
  <tbody>
    {#each sortedMetrics as metric (metric.id)}
      <tr
        animate:flip={{ duration: 100 }}
        class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <td class="{compact ? 'px-2 py-0.5' : 'px-4 py-1'} font-medium align-middle">
          {#if (metric.description || metric.formula) && !compact}
            <div class="inline-flex items-center relative tooltip-container group cursor-help overflow-visible">
              <span class="border-b border-dotted border-slate-400 dark:border-slate-600 w-max">
                {metric.displayName}
              </span>
              <div class="hidden group-hover:block isolate absolute left-4 z-9999 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded shadow-lg bottom-full mb-1 w-72 overflow-visible">
                {#if metric.description}
                  <p class="text-sm font-normal text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                    {metric.description}
                  </p>
                {/if}
                {#if metric.formula}
                  <p class="text-center text-base">
                    <Tex math={metric.formula} />
                  </p>
                {/if}
              </div>
            </div>
          {:else}
            <span class="w-max">
              {metric.displayName}
            </span>
          {/if}
        </td>
        <td class="{compact ? 'px-2' : 'px-4'} text-right font-mono font-bold align-middle">{#if metric.value >= 0}<span class="select-none">&ensp;</span>{/if}<FlashSpan text={formatMetricValue(metric.value, showMetricsAsPercentage, floatingPrecision, metric.bounds)}/></td>
        {#if showBar}
          <td class="w-32 {compact ? 'px-2' : 'px-4'} align-middle">
            <div class="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-sm overflow-hidden flex">
              <div
                class="bg-accent h-full"
                style="width:{Math.max(0, Math.min(100, ((metric.value - metric.bounds[0]) / (metric.bounds[1] - metric.bounds[0])) * 100))}%"
              ></div>
            </div>
          </td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>