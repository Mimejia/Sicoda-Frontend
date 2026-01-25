<template>
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="white" />
      <path
        d="M8 8L16 16M16 8L8 16"
        :stroke="color"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  </template>
  
  <script>
  export default {
    name: 'IconX',
    props: {
      size: {
        type: [String, Number],
        default: 20
      },
      color: {
        type: String,
        default: '#F64E60'
      }
    }
  }
  </script>
  