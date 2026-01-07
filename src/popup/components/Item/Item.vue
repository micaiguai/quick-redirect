<script setup lang="ts">
import type { Stage } from '~/popup'

import Delete from '../Delete/Delete.vue'
import Rename from '../Rename/Rename.vue'
import Input from '../Input/Input.vue'
import { EMPTY_TEXT } from '~/constants/empty'
import { isTextEmpty } from '~/popup/utils/string'

export interface Props {
  id?: string
  icon?: string
  title?: string
  url?: string
  type: 'search' | 'tab' | 'bookmark'
  active?: boolean
}

export interface Emits {
  (e: 'update'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stage = ref<Stage>('idle')
const title = ref(props.title)
const renameRef = ref<InstanceType<typeof Rename>>()
</script>

<template>
  <div
    class="h-8 mt-2 cursor-pointer grid grid-rows-1 grid-flow-col grid-cols-[auto_minmax(0,1fr)_auto] justify-start items-center px-2 rounded relative"
    :class="[
      active ? 'bg-gray-200' : 'hover:bg-gray-100',
    ]"
  >
    <div class="relative w-4 h-4 inline-block mr-2">
      <img v-if="icon" :src="icon" alt="favicon" class="w-full h-full">
      <div v-if="type === 'tab'" class="absolute top-0 right-0 transform translate-x-[50%] translate-y-[-50%] w-1.5 h-1.5 bg-blue-500 rounded-full ring-1 ring-white shadow" />
    </div>
    <div>
      <div
        v-if="['idle', 'deleting'].includes(stage!)"
        class="grid grid-cols-1 auto-rows-auto justify-start content-center justify-items-start truncate py-1  leading-none"
      >
        <span class="text-[12px] mb-1">
          {{ isTextEmpty(title) ? EMPTY_TEXT : title }}
        </span>
        <span class="text-[8px] text-gray-500">
          {{ isTextEmpty(url) ? EMPTY_TEXT : url }}
        </span>
      </div>
      <div v-else class="mr-2">
        <Input
          v-model="title"
          @click.stop
          @keyup.enter.stop="renameRef?.submit()"
        />
      </div>
    </div>
    <div
      class="grid grid-flow-col items-center justify-start gap-1"
      :class="[
        ['renaming', 'deleting'].includes(stage) ? 'relative right-0 top-0' : 'absolute right-2 top-0 opacity-0 hover:opacity-100 !hover:relative hover:right-0 ',
      ]"
    >
      <Rename
        v-if="type === 'bookmark' && ['idle', 'renaming'].includes(stage!)"
        :id="id!"
        ref="renameRef"
        v-model:stage="stage"
        :title="title!"
        @update="emit('update')"
      />
      <Delete
        v-if="['bookmark', 'tab'].includes(type) && ['idle', 'deleting'].includes(stage!)"
        :id="id!"
        v-model:stage="stage"
        :type="type"
        @update="$nextTick(() => emit('update'))"
      />
    </div>
  </div>
</template>
