<script setup lang="ts">
import type { Stage, Type } from '~/popup'

export interface Props {
  id: string
  type: Type
  class?: string
}
export interface Emits {
  (e: 'update'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stage = defineModel<Stage>('stage')

function onClick() {
  if (props.type === 'tab') {
    browser.tabs.remove(Number(props.id))
    emit('update')
  }
  else if (props.type === 'bookmark') {
    browser.bookmarks.remove(props.id)
    emit('update')
  }
}
</script>

<template>
  <div
    v-if="stage === 'idle'"
    class="lh-8 text-[10px] text-red-400 cursor-pointer hover:text-red-600 select-none"
    @click.stop="stage = 'deleting'"
  >
    Delete
  </div>
  <div v-else class="lh-8 grid grid-flow-col items-center justify-start gap-1">
    <div class="text-[10px] text-red-400 cursor-pointer hover:text-red-600 select-none" @click.stop="onClick">
      Confirm
    </div>
    <div class="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 select-none" @click.stop="stage = 'idle'">
      Cancel
    </div>
  </div>
</template>
