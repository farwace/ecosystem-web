<template>
  <Transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
      :appear="transitionOnAppear"
  >
    <component
        :is="tag"
        v-show="expanded"
        ref="wrapper"
        :style="baseStyle"
    >
      <slot />
    </component>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Easing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | `cubic-bezier(${number}, ${number}, ${number}, ${number})`

interface Props {
  /** Управляет раскрытием. true -> slideDown, false -> slideUp */
  expanded: boolean
  /** Длительность анимации в мс (по умолчанию 300) */
  duration?: number
  /** CSS-easing для transition (по умолчанию 'ease') */
  easing?: Easing
  /** Анимировать также прозрачность (по умолчанию true) */
  opacity?: boolean
  /** Тег-обёртка (по умолчанию 'div') */
  tag?: string
  /** Запускать анимацию при первом появлении компонента */
  transitionOnAppear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 300,
  easing: 'ease',
  opacity: true,
  tag: 'div',
  transitionOnAppear: false,
})

const wrapper = ref<HTMLElement | null>(null)

// Учитываем prefers-reduced-motion — если пользователь просит меньше анимаций, делаем мгновенно
const effectiveDuration = computed(() => {
  if (typeof window !== 'undefined') {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (m?.matches) return 0
  }
  return props.duration
})

const baseStyle = computed(() => ({
  overflow: 'hidden',
  willChange: 'height, opacity',
}))

function setTransition(el: HTMLElement) {
  const parts = [`height ${effectiveDuration.value}ms ${props.easing}`]
  if (props.opacity) parts.push(`opacity ${effectiveDuration.value}ms ${props.easing}`)
  el.style.transition = parts.join(', ')
}

function clearTransition(el: HTMLElement) {
  el.style.transition = ''
}

function beforeEnter(el: Element) {
  const node = el as HTMLElement
  node.style.height = '0'
  if (props.opacity) node.style.opacity = '0'
}

function enter(el: Element) {
  const node = el as HTMLElement
  setTransition(node)
  // Важно: сначала измеряем естественную высоту
  const target = `${node.scrollHeight}px`
  // Следующим кадром запускаем переход
  requestAnimationFrame(() => {
    node.style.height = target
    if (props.opacity) node.style.opacity = '1'
  })
}

function afterEnter(el: Element) {
  const node = el as HTMLElement
  node.style.height = 'auto'
  clearTransition(node)
}

function beforeLeave(el: Element) {
  const node = el as HTMLElement
  // Фиксируем текущую высоту, чтобы стартовать из неё
  node.style.height = `${node.scrollHeight}px`
  if (props.opacity) node.style.opacity = '1'
}

function leave(el: Element) {
  const node = el as HTMLElement
  // Если контент менялся и высота могла "просесть", переустановим её синхронно
  node.style.height = `${node.scrollHeight}px`
  // Затем включаем переход и уходим к 0
  setTransition(node)
  requestAnimationFrame(() => {
    node.style.height = '0'
    if (props.opacity) node.style.opacity = '0'
  })
}

function afterLeave(el: Element) {
  const node = el as HTMLElement
  clearTransition(node)
}
</script>

<style scoped>
/* Опционально: убираем "рывки" текста в некоторых браузерах во время анимации */
:slotted(*) {
  contain: content;
}
</style>
