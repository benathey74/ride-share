export const SavedPlaceKind = {
  HOME: 'home',
  WORK: 'work',
  PICKUP: 'pickup',
  CUSTOM: 'custom',
} as const

export type SavedPlaceKindValue = (typeof SavedPlaceKind)[keyof typeof SavedPlaceKind]
