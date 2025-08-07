import type {DirectiveBinding, VNode} from "vue";
import {Console} from "@/classes/utils/Console.ts";

export const vMarquee = {
    mounted: function (el:HTMLElement, binding: DirectiveBinding, vnode: VNode){
        Console.log(el, el.scrollWidth, el.clientWidth, binding.value);
        if(el.scrollWidth > el.clientWidth){
            el.classList.add(binding.value as string);
            let mW = el.scrollWidth - el.clientWidth;
            el.style.setProperty('--marquee-width',  '-' + mW + 'px');
            let speed = mW/5;
            if(speed < 8) {speed = 8}
            el.style.setProperty('--marquee-duration', speed + 's');
        }
    },
}