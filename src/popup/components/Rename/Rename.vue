<script setup lang="ts">
export interface Props {
  id: string
  title: string
}
export interface Emits {
  (e: 'update'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stage = defineModel('stage')

function submit() {
  browser.bookmarks.update(props.id, {
    title: props.title,
  })
  stage.value = 'idle'
  emit('update')
}

defineExpose({
  submit,
})
</script>

<template>
  <div
    v-if="stage === 'idle'"
    class="lh-8 text-[10px] text-blue-400 cursor-pointer hover:text-blue-600 select-none"
    @click.stop="stage = 'renaming'"
  >
    Rename
  </div>
  <div v-else class="lh-8 grid grid-flow-col items-center justify-start gap-1">
    <div class="text-[10px] text-blue-400 cursor-pointer hover:text-blue-600 select-none" @click.stop="submit">
      Confirm
    </div>
    <div class="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 select-none" @click.stop="stage = 'idle'">
      Cancel
    </div>
  </div>
</template>
