export interface MouseDragEventDetail {
    event: MouseEvent;
}

export interface MouseDirectedDragEventDetail {
    value: number;
}

export function mouseDrag(node: HTMLElement, preventDefault=false) {
    let isDragging = false; 

	const handleMouseDown = (event: MouseEvent) => {
        if (preventDefault) event.preventDefault();
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);
	};

    const handleMouseUp = (event: MouseEvent) => {
        if (isDragging) {
            node.dispatchEvent(
                new CustomEvent<MouseDragEventDetail>("mousedragend", {detail: {event}})
            );
            isDragging = false;
        }

        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
	};

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging) {
            node.dispatchEvent(
                new CustomEvent<MouseDragEventDetail>("mousedragstart", {detail: {event}})
            );
            isDragging = true;
        }
        node.dispatchEvent(
            new CustomEvent<MouseDragEventDetail>("mousedrag", {detail: {event}})
        );
 };

	node.addEventListener("mousedown", handleMouseDown, true);

	return {
		destroy() {
			node.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
		}
	};
}


export function mouseDirectedDrag(
    node: HTMLElement,
    direction: "up" | "down" | "left" | "right" = "down",
    step: number = 1,
    factor: number = 0.1) {
    const mouseDragAction = mouseDrag(node);
    let current = 0;

    const handleMouseDrag = (e: CustomEvent<MouseDragEventDetail>) => {
        const event = e.detail.event;
        let delta = 0.0;
        if (direction == "right") delta = event.movementX;
        else if (direction == "up") delta = event.movementY;
        else if (direction == "left") delta = -event.movementX;
        else if (direction == "down") delta = -event.movementY;
        if (event.shiftKey) delta *= 10;
        if (event.altKey) delta *= 0.1;
        delta *= factor;

        node.dispatchEvent(
            new CustomEvent<MouseDirectedDragEventDetail>("mousedirecteddrag", {detail: {value: delta}})
        );

        current += delta;
        if (current > step || current <- step) {
            node.dispatchEvent(
                new CustomEvent<MouseDirectedDragEventDetail>("mousedirecteddragstep", {detail: {value: current - (current % step)}})
            );
            current = current % step
        }
	};
    node.addEventListener("mousedrag", handleMouseDrag as EventListener);

    return {
  destroy() {
            mouseDragAction.destroy();
   node.removeEventListener("mousedrag", handleMouseDrag as EventListener);
  }
 };
}

