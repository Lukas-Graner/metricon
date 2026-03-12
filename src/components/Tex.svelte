<script lang="ts">
  import katex from "katex";

  interface Props {
    math?: string;
    block?: boolean;
  }

  let { math = "", block = false }: Props = $props();
</script>

{#if block}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div>{@html katex.renderToString(math)}</div>
{:else}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <span>{@html katex.renderToString(math)}</span>
{/if}
