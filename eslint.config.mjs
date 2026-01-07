import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'import-x/order': [
      'error',
      {
        groups: [
          'type',
          ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        ],
      },
    ],
  },
})
