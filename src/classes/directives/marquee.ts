import {nextTick, type DirectiveBinding} from "vue";
import {Console} from "@/classes/utils/Console.ts";

type MarqueeHTMLElement = HTMLElement & {
    __marqueeCleanup?: () => void;
    __marqueeApply?: () => void;
};

const MIN_SPEED_SECONDS = 7;
const SPEED_DIVISOR = 5;
const WIDTH_PADDING_PX = 2;

function applyMarquee(el: HTMLElement, binding: DirectiveBinding) {
    const className = typeof binding.value === "string" ? binding.value : undefined;
    if (!className) {
        return;
    }

    const overflowWidth = el.scrollWidth - el.clientWidth;

    if (overflowWidth > 0) {
        const marqueeWidth = overflowWidth + WIDTH_PADDING_PX;
        const speed = Math.max(marqueeWidth / SPEED_DIVISOR, MIN_SPEED_SECONDS);

        el.classList.add(className);
        el.style.setProperty("--marquee-width", `-${marqueeWidth}px`);
        el.style.setProperty("--marquee-duration", `${speed}s`);
    } else {
        el.classList.remove(className);
        el.style.removeProperty("--marquee-width");
        el.style.removeProperty("--marquee-duration");
    }
}

function scheduleApply(el: HTMLElement, binding: DirectiveBinding) {
    nextTick(() => {
        requestAnimationFrame(() => {
            applyMarquee(el, binding);
        });
    });
}

export const vMarquee = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const marqueeEl = el as MarqueeHTMLElement;

        marqueeEl.__marqueeApply = () => scheduleApply(el, binding);
        marqueeEl.__marqueeCleanup = () => {
            const className = typeof binding.value === "string" ? binding.value : undefined;
            if (!className) {
                return;
            }
            el.classList.remove(className);
            el.style.removeProperty("--marquee-width");
            el.style.removeProperty("--marquee-duration");
        };

        Console.log(el, el.scrollWidth, el.clientWidth, binding.value);
        scheduleApply(el, binding);
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
        (el as MarqueeHTMLElement).__marqueeApply = () => scheduleApply(el, binding);
        scheduleApply(el, binding);
    },
    beforeUnmount(el: HTMLElement) {
        const marqueeEl = el as MarqueeHTMLElement;
        marqueeEl.__marqueeCleanup?.();
        marqueeEl.__marqueeApply = undefined;
    },
};
