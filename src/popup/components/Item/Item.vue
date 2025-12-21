<script setup lang="ts">
import { EMPTY_TEXT } from '~/constants/empty'

export interface Props {
  icon?: string
  title?: string
  url?: string
  type: 'search' | 'tab' | 'bookmark'
  active?: boolean
}

const props = defineProps<Props>()

const className = computed(() => {
  const base = 'mt-2 cursor-pointer flex items-center justify-start px-2 py-1 rounded'
  return `${base} ${props.active ? 'bg-gray-200' : 'hover:bg-gray-100'}`
})
</script>

<template>
  <div :class="className">
    <div class="relative w-4 h-4 inline-block">
      <img v-if="icon" :src="icon" alt="favicon" class="w-full h-full">
      <div v-if="type === 'tab'" class="absolute top-0 right-0 transform translate-x-[50%] translate-y-[-50%] w-1.5 h-1.5 bg-blue-500 rounded-full ring-1 ring-white shadow" />
    </div>
    <div class="flex-1 ml-2 flex flex-col leading-none justify-start items-start truncate">
      <div class="text-[12px] mb-1">
        {{ title || EMPTY_TEXT }}
      </div>
      <div class="text-[8px] text-gray-500">
        {{ url || EMPTY_TEXT }}
      </div>
    </div>
  </div>
</template>
