<script lang="ts">
    import {settings } from "../utils/settings.svelte"
    
	interface Props {
		text: string;
	}

    let { text }: Props  = $props();
    let span: HTMLSpanElement;
    
    $effect(() => {
        if (text && span) {
            requestAnimationFrame(() => {
                if (!span) return;
                span.style.transition = "none";
                if (settings.darkMode) {
                    span.style.backgroundColor = "hsl(224.7,50%,40%)";
                    span.style.boxShadow = "0px 0px 8px 5px hsl(224.7,50%,40%)";
                } else {
                    span.style.backgroundColor = "hsl(210,100%,89%)";
                    span.style.boxShadow = "0px 0px 8px 5px hsl(210,100%,89%)";
                }

                setTimeout(() => {
                    if (!span) return;
                    span.style.transition = "background 0.75s, box-shadow 0.75s";
                    span.style.boxShadow = "";
                    span.style.backgroundColor = "";
                });
            });
        }
    })
</script>

<span bind:this={span}>{text}</span>