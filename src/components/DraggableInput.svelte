<script lang="ts">
  import { mouseDirectedDrag } from "../utils/mouseDrag";

  interface Props {
    value: number;
    min?: number;
    max?: number;
    style?: string;
    classs?: string;
    id?: string;
  }

  let { value = $bindable(), min = 0, max = Number.MAX_VALUE, style = "", classs = "", id = "" }: Props = $props();
</script>

<input
  {id}
  {style}
  class={classs}
  type="number"
  bind:value={value}
  {min}
  {max}
  use:mouseDirectedDrag
  onmousedirecteddragstep={(e) => value = Math.max(min, Math.min(max, value + e.detail.value))}
/>
