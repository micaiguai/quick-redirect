<script setup lang="ts">
import { asyncComputed, useEventListener } from '@vueuse/core'
import { fuzzyMatch } from './utils/match'

interface Item {
  id?: number
  title: string
  url: string
  type: 'search' | 'tab' | 'bookmark'
}

const ITEM_SIZE
  /** Height */
  = 26
  /** Margin */
  + 8

const inputRef = ref<HTMLInputElement>()
const input = ref('')
const itemsContainerRef = ref<HTMLDivElement>()

const displayedItems: Ref<Item[]> = asyncComputed(async () => {
  if (input.value === '') {
    return []
  }
  const tabs = await browser.tabs.query({})
  const filteredTabs = tabs.filter((tab) => {
    if (tab.title === undefined || tab.url === undefined) {
      return false
    }
    return fuzzyMatch(tab.title, input.value) || fuzzyMatch(tab.url, input.value)
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
  itemsContainerRef.value?.scrollTo({
    top: ITEM_SIZE * (activeIdx.value - 1),
  })
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
  <main class="w-[300px] max-h-[400px] text-center text-gray-700 overflow-auto flex flex-col pt-4">
    <div class="px-4">
      <input ref="inputRef" v-model="input" type="text" placeholder="Search" class="w-full px-2 py-1 border border-gray-400 rounded">
    </div>
    <div ref="itemsContainerRef" class="flex-1 overflow-auto px-4 pb-4">
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
    </div>
  </main>
</template>
