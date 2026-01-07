<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const visible = ref(false)
const pos = ref({
  x: 0,
  y: 0,
})
const contextRef = ref<HTMLDivElement>()
const wrapperRef = ref<HTMLDivElement>()

useEventListener(wrapperRef, 'contextmenu', (e) => {
  const shiftKey = e.shiftKey
  if (shiftKey) {
    return
  }
  e.stopPropagation()
  e.preventDefault()

  visible.value = true
  pos.value = {
    x: e.pageX + 4,
    y: e.pageY + 4,
  }
})

useEventListener(document, ['click', 'contextmenu'], (e) => {
  if (contextRef.value?.contains(e.target as Node)) {
    return
  }
  visible.value = false
})
</script>

<template>
  <div ref="wrapperRef">
    <slot />
    <Teleport to="body">
      <div
        v-show="visible"
        ref="contextRef"
        class="absolute bg-white rounded ring-.5 ring-gray-300 overflow-hidden py-1"
        :style="{
          top: `${pos.y}px`,
          left: `${pos.x}px`,
        }"
      >
        <div class="w-[100px] hover:bg-gray-100 grid grid-flow-col justify-start items-center gap-2 p-2 cursor-pointer">
          <span>🗑</span>
          <span>Delete</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>
