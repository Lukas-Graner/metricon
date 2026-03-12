<script lang="ts">
  import { confusionmatrixmetrics } from "../utils/metrics";
  import { settings } from "../utils/settings.svelte";
  import DataTable from "./DataTable.svelte";

  interface Props {
    matrix: number[][];
    floatingPrecision?: number;
    showMetricsAsPercentage?: boolean;
    showBar?: boolean;
    compact?: boolean;
  }

  let { matrix, floatingPrecision = 3, showMetricsAsPercentage = false, showBar = true, compact = false }: Props = $props();

  let visibleMetrics = $derived(
    Object.values(confusionmatrixmetrics).filter(m => m.level <= settings.metricVisibilityLevel)
  );

  let tableData = $derived(visibleMetrics.map(m => ({
    id: m.id,
    displayName: m.displayName,
    formula: m.formula,
    description: m.description,
    bounds: m.bounds,
    value: m.calc(matrix)
  })))
</script>
<DataTable metrics={tableData} {floatingPrecision} {showMetricsAsPercentage} {showBar} {compact} sortType={settings.tableSortType} title="Performance Metrics" />