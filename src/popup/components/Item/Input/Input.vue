<script setup lang="ts">
const inputRef = shallowRef<HTMLInputElement>()

const model = defineModel<string>({
  default: '',
})

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement)?.value || ''
  model.value = value
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input
    ref="inputRef"
    :value="modelValue"
    type="text"
    placeholder="Please input"
    class="w-full px-2 py-1 border h-6 outline-none border-none border-gray-400 rounded"
    @input="onInput"
  >
</template>
