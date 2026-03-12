import type { MouseDragEventDetail, MouseDirectedDragEventDetail } from './utils/mouseDrag';

declare module 'svelte/elements' {
	export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
		onmousedirecteddragstep?: ((e: CustomEvent<MouseDirectedDragEventDetail>) => void) | null;
		onmousedirecteddrag?: ((e: CustomEvent<MouseDirectedDragEventDetail>) => void) | null;
		onmousedrag?: ((e: CustomEvent<MouseDragEventDetail>) => void) | null;
		onmousedragstart?: ((e: CustomEvent<MouseDragEventDetail>) => void) | null;
		onmousedragend?: ((e: CustomEvent<MouseDragEventDetail>) => void) | null;
	}
}

export {};
