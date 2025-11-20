<script setup lang="ts">
import { asyncComputed, useEventListener } from '@vueuse/core'

interface Item {
  id?: number
  title: string
  url: string
  type: 'search' | 'tab' | 'bookmark'
}

const inputRef = ref<HTMLInputElement>()
const input = ref('')

const displayedItems: Ref<Item[]> = asyncComputed(async () => {
  if (input.value === '') {
    return []
  }
  const tabs = await browser.tabs.query({})
  const filteredTabs = tabs.filter((tab) => {
    return tab.title?.includes(input.value) || tab.url?.includes(input.value)
  })
  const bookmarks = await browser.bookmarks.search(input.value)
  const items = [
    ...filteredTabs.map(tab => ({
      title: tab.title ?? '',
      url: tab.url ?? '',
      type: 'tab' as Item['type'],
      id: tab.id,
    })),
    ...bookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url ?? '',
      type: 'bookmark' as Item['type'],
    })),
  ]
  items.splice(1, 0, {
    title: `search: ${input.value}`,
    url: `https://www.google.com/search?q=${input.value}`,
    type: 'search' as Item['type'],
  })
  return items
})

const activeIdx = ref(0)

watch(displayedItems, (items) => {
  const idx = Math.min(activeIdx.value, items.length - 1)
  activeIdx.value = idx < 0 ? 0 : idx
})

useEventListener('keydown', (e) => {
  const len = displayedItems.value.length ?? 0
  if (e.key === 'ArrowUp') {
    activeIdx.value = (activeIdx.value - 1) % len
  }
  else if (e.key === 'ArrowDown') {
    activeIdx.value = (activeIdx.value + 1) % len
  }
})

useEventListener('keydown', async (e) => {
  if (displayedItems.value === undefined) {
    return
  }
  if (e.key === 'Enter') {
    triggerItem()
    window.close()
  }
})

function triggerItem() {
  const item = displayedItems.value[activeIdx.value]
  if (item?.type === 'search') {
    browser.tabs.create({ url: item.url })
  }
  if (item?.type === 'bookmark') {
    browser.tabs.create({ url: item.url })
  }
  if (item?.type === 'tab') {
    browser.tabs.update(item.id, { active: true })
  }
}

function onClick(idx: number) {
  activeIdx.value = idx
  triggerItem()
  window.close()
}

onMounted(async () => {
  inputRef.value?.focus()
})
</script>

<template>
  <main class="w-[300px] p-4 text-center text-gray-700">
    <input ref="inputRef" v-model="input" type="text" placeholder="Search" class="w-full px-2 py-1 border border-gray-400 rounded">
    <div
      v-for="(item, idx) in displayedItems"
      :key="idx"
      class="mt-2 cursor-pointer flex items-center justify-start px-2 py-1 rounded"
      :class="{ 'bg-gray-200': idx === activeIdx }"
      @click="onClick(idx)"
    >
      <div class="w-4 h-4 inline-block">
        {{ item.type === 'search' ? '🔍' : item.type === 'bookmark' ? '⭐' : '🔵' }}
      </div>
      <div class="flex-1 ml-2 flex justify-start truncate">
        {{ item.title }}
        {{ item.url }}
      </div>
    </div>
  </main>
</template>
