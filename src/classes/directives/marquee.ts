import type {DirectiveBinding, VNode} from "vue";
import {Console} from "@/classes/utils/Console.ts";
import {type} from "@colyseus/schema";

export const vMarquee = {
    mounted: function (el:HTMLElement, binding: DirectiveBinding, vnode: VNode){
        const doAction = (el: HTMLElement, className: string, vnode: VNode) => {
            if(el.scrollWidth > el.clientWidth){
                el.classList.add(className);
                let mW = el.scrollWidth - el.clientWidth + 2;
                el.style.setProperty('--marquee-width',  '-' + mW + 'px');
                let speed = mW/5;
                if(speed < 7) {speed = 7}
                el.style.setProperty('--marquee-duration', speed + 's');
            }
        }

        Console.log(el, el.scrollWidth, el.clientWidth, binding.value);
        if(typeof binding.value === 'string'){
            doAction(el, binding.value, vnode);
        }
    },
}