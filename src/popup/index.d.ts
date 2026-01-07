export type Type = 'tab' | 'bookmark' | 'search'

export interface Bookmark {
  id: string
  icon: string
  title: string
  url: string
  active: boolean
}

export interface Search {
  id: string
  icon: string
  title: string
  url: string
  active: boolean
}

export type Stage = 'idle' | 'deleting' | 'renaming'
