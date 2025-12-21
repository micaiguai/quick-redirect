<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { throttle } from 'lodash'
import type { Props as ItemProps } from './components/Item/Item.vue'
import Input from './components/Item/Input/Input.vue'

import Item from './components/Item/Item.vue'
import { fuzzyMatch } from './utils/match'

type ItemT = Partial<ItemProps> & {
  id?: string
  windowId?: number
}

const ITEM_SIZE
  /** Height */
  = 32
  /** Margin */
  + 8
const ICON_SIZE = 48

const itemsContainerRef = shallowRef<HTMLDivElement>()
const input = ref('')
const curIndex = ref(0)
const items = ref<ItemT[]>([])

watch(items, () => {
  const idx = Math.min(curIndex.value, items.value.length - 1)
  curIndex.value = idx < 0 ? 0 : idx
})

useEventListener('keydown', (e) => {
  const len = items.value.length ?? 0
  if (e.key === 'ArrowUp') {
    curIndex.value = (len + curIndex.value - 1) % len
  }
  else if (e.key === 'ArrowDown') {
    curIndex.value = (len + curIndex.value + 1) % len
  }
  itemsContainerRef.value?.scrollTo({
    top: ITEM_SIZE * (curIndex.value - 1),
  })
  if (e.key === 'Enter' && len > 0 && curIndex.value >= 0) {
    const updated = triggerItem()
    if (updated) {
      window.close()
    }
  }
})

function triggerItem() {
  let updated = false

  const item = items.value[curIndex.value]
  if (item?.type === 'search' && item.url) {
    updated = true
    browser.tabs.create({ url: item.url })
  }
  if (item?.type === 'bookmark' && item.url) {
    updated = true
    browser.tabs.create({ url: item.url })
  }
  if (item?.type === 'tab' && item.id) {
    if ('id' in item && item.id !== undefined) {
      updated = true
      browser.tabs.update(Number(item.id), { active: true })
    }
    if ('windowId' in item && item.windowId !== undefined) {
      updated = true
      browser.windows.update(item.windowId, { focused: true })
    }
  }

  return updated
}

function onClick(idx: number) {
  curIndex.value = idx
  const updated = triggerItem()
  if (updated) {
    window.close()
  }
}

const updateItems = throttle(async () => {
  const _items: ItemT[] = []
  if (!input.value) {
    items.value = _items
    return
  }
  const tabs = await browser.tabs.query({})
  const filteredTabs = tabs
    .filter((tab) => {
      if (tab.title === undefined || tab.url === undefined) {
        return false
      }
      return fuzzyMatch(tab.title, input.value) || fuzzyMatch(tab.url, input.value)
    })
    .map(tab => ({
      id: tab.id ? String(tab.id) : undefined,
      title: tab.title,
      url: tab.url,
      type: 'tab' as ItemT['type'],
      icon: tab.favIconUrl,
      windowId: tab.windowId,
    }))
  const bookmarks = (await browser.bookmarks.search(input.value))
    .map((bookmark) => {
      const url = bookmark.url ? encodeURIComponent(bookmark.url) : ''
      return {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url ?? '',
        type: 'bookmark' as ItemT['type'],
        icon: `chrome-extension://${browser.runtime.id}/_favicon/?pageUrl=${url}&size=${ICON_SIZE.toString()}`,
      }
    })
  _items.push(
    ...filteredTabs,
    ...bookmarks,
  )
  _items.splice(1, 0, {
    title: `search: ${input.value}`,
    url: `https://www.google.com/search?q=${input.value}`,
    type: 'search' as ItemT['type'],
    icon: 'https://www.google.com/favicon.ico',
  })

  items.value = _items
})

async function onInputUpdate(value: string) {
  input.value = value
  updateItems()
}
</script>

<template>
  <main class="w-[300px] max-h-[400px] text-center text-gray-700 overflow-y-auto flex flex-col pt-2 rounded">
    <div class="px-1">
      <Input
        :model-value="input"
        @update:model-value="onInputUpdate"
      />
    </div>
    <div ref="itemsContainerRef" class="flex-1 overflow-auto px-2 pb-2">
      <Item
        v-for="(item, index) in items"
        :key="index"
        :active="index === curIndex"
        :icon="item.icon"
        :title="item.title"
        :url="item.url"
        :type="item.type ?? 'tab'"
        @click="onClick(index)"
      />
    </div>
  </main>
</template>
