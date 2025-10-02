<template>
  <div class="wheel-modal">
    <div class="wheel-wrap">
      <div class="pointer"></div>
      <div
          class="disk"
          :style="{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${durationMs}ms cubic-bezier(.12,.84,.22,1)` : 'none'
        }"
          @transitionend="onEnd"
      >
        <div
            v-for="(r, i) in rewards"
            :key="r.id ?? i"
            class="segment-label"
            :style="labelStyle(i)"
        >
<!--          <span class="icon" v-if="r.icon">{{ r.icon }}</span>-->
          <span class="icon" v-if="r.icon">
            <UiIcon :name="r.icon" />
          </span>
          <span class="label">{{ r.label }}</span>
        </div>
        <div class="hub"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import UiIcon from "@/components/common/icons/UiIcon.vue";

export interface Reward {
  id: string
  label: string
  icon?: string
}

interface SpinOptions {
  spins?: number
  durationMs?: number
}

const props = withDefaults(defineProps<{
  rewards: Reward[]
  duration?: number
  colors?: string[]
}>(), {
  duration: 5000,
  colors: () => [
    '#f2b36d',
    '#e7806e',
    '#e9cf7a',
    '#9ccf93',
    '#6bb7c9',
    '#6aa6cc',
    '#9ad3f1',
    '#c3e5b5'
  ]
})

const emit = defineEmits<{
  (e: 'start'): void
  (e: 'finished', payload: { index: number; reward: Reward }): void
}>()

const rewards = computed(() => props.rewards ?? [])
const baseDuration = computed(() => props.duration)
const colors = computed(() => props.colors)

const N = computed(() => rewards.value.length)
const seg = computed(() => (N.value ? 360 / N.value : 0))

const rotation = ref(0)
const durationMs = ref(0)
const selectedIndex = ref(-1)
const spinning = ref(false)
const finishResolve = ref<null | ((value: void) => void)>(null)

const gradient = computed(() => {
  if (N.value === 0) return ''

  const parts: string[] = []
  for (let i = 0; i < N.value; i++) {
    const start = i * seg.value
    const end = (i + 1) * seg.value
    const color = colors.value[i % colors.value.length]
    parts.push(`${color} ${start}deg ${end}deg`)
  }
  return `conic-gradient(from -90deg, ${parts.join(',')})`
})

function labelStyle(i: number) {
  if (N.value === 0) return {}

  const angle = i * seg.value + seg.value / 2
  const polar = angle - 90
  const rad = (Math.PI / 180) * polar
  const radiusPct = 35
  const x = 50 + Math.cos(rad) * radiusPct
  const y = 50 + Math.sin(rad) * radiusPct

  // Компенсируем только наклон сегмента, но оставляем текст горизонтальным
  const textRotation = -rotation.value // Компенсируем общее вращение колеса

  return {
    left: x + '%',
    top: y + '%',
    transform: `translate(-50%,-50%) rotate(${textRotation}deg)`
  }
}

async function spinTo(index: number, options: SpinOptions = {}) {
  if (N.value === 0) return Promise.resolve()
  if (spinning.value) return Promise.resolve()

  spinning.value = true
  emit('start')

  const spins = options.spins ?? 6
  const duration = options.durationMs ?? baseDuration.value

  selectedIndex.value = ((index % N.value) + N.value) % N.value

  // Текущий угол в диапазоне 0-360
  const currentRotation = ((rotation.value % 360) + 360) % 360

  // Целевой угол (центр сегмента), который должен оказаться под указателем
  // Указатель находится вверху (0°), поэтому нам нужно чтобы центр сегмента оказался на 0°
  const targetSegmentCenter = selectedIndex.value * seg.value + seg.value / 2
  const targetRotation = 360 - targetSegmentCenter

  // Вычисляем разницу между текущим положением и целевым
  let delta = targetRotation - currentRotation

  // Убедимся, что delta положительная (движение вперед)
  if (delta < 0) {
    delta += 360
  }

  // Добавляем полные обороты
  const fullRotations = spins * 360
  const finalRotation = rotation.value + fullRotations + delta

  durationMs.value = duration
  await nextTick()
  rotation.value = finalRotation

  return new Promise<void>((resolve) => {
    finishResolve.value = resolve
  })
}

async function onEnd(e: TransitionEvent) {
  if (e.propertyName !== 'transform') return
  if (!spinning.value) return

  // Нормализуем rotation к диапазону 0-360
  rotation.value = ((rotation.value % 360) + 360) % 360

  const reward = rewards.value[selectedIndex.value]
  spinning.value = false
  emit('finished', { index: selectedIndex.value, reward })

  if (finishResolve.value) {
    finishResolve.value()
    finishResolve.value = null
  }
}

function spinToId(id: string, options: SpinOptions = {}) {
  const idx = rewards.value.findIndex(r => r.id === id)
  if (idx === -1) return Promise.resolve()
  return spinTo(idx, options)
}

defineExpose({ spinTo, spinToId, spinning })
</script>

<style scoped>
.wheel-modal {
  display: grid;
  gap: 16px;
  justify-items: center;
  padding: 16px;
  color: #6b4423;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, 'Noto Sans', sans-serif;
}

.wheel-wrap {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-bottom: 24px solid #f0a06a;
  transform: translateX(-50%) rotate(180deg) translateZ(1px);
  z-index: 4;
  filter: drop-shadow(0 2px 0 rgba(0,0,0,.08));
  border-radius: 2px;
}

.disk {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 12px solid #f3d8b6;
  box-shadow: inset 0 0 0 6px #f7e9d8, 0 6px 18px rgba(0,0,0,.08);
  background-image: v-bind(gradient);
  display: grid;
  place-items: center;
  overflow: hidden;
  transform-origin: center;
  z-index: 3;
}

.segment-label {
  position: absolute;
  transform-origin: center;
  text-align: center;
  user-select: none;
  font-weight: 700;
  font-size: clamp(10px, 2.7vw, 16px);
  line-height: 1.1;
  pointer-events: none;
}

.segment-label .icon {
  display: block;
  font-size: 22px;
  line-height: 1;
  svg{
    width: 30px;
    height: 30px;
  }
}

.segment-label .label {
  display: block;
  opacity: .8;
}

.hub {
  position: absolute;
  width: 22%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffd9b5, #f0a06a);
  border: 6px solid #f7e9d8;
  z-index: 2;
}
</style>