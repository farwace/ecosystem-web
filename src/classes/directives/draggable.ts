import Draggabilly from "draggabilly";
import type {DirectiveBinding, VNode} from "vue";

declare global {
    interface HTMLElement {
        draggie?: Draggabilly
    }
}

export const vDraggable = {
    mounted: function(el:HTMLElement, binding: DirectiveBinding, vnode: VNode){
        const containment = binding.value.containment || false as Element | string | boolean | undefined;
        const isStatic = binding.value.isStatic || undefined as boolean | undefined;
        if(!isStatic){
            el.draggie = new Draggabilly(el, {
                containment: containment,
            });
            el.draggie.on('dragStart', function (){
                el.dispatchEvent(new CustomEvent('panelDragStart'))
            });
            el.draggie.on('dragEnd', function (this:Draggabilly) {
                el.dispatchEvent(new CustomEvent('panelDragStop', {detail: {position: this.position}}));
            });
        }

    },
    beforeUnmount: function (el:HTMLElement){
        if(el.draggie){
            el.draggie.destroy();
            el.draggie = undefined
        }
    }
}