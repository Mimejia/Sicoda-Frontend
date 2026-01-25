<template>
    <svg
      :width="size"
      :height="size"
      :fill="color"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 
        1.08.022l3.992-4.99a.75.75 0 0 0-1.144-.976L7.525 9.428 
        6.08 8.072a.75.75 0 1 0-1.06 1.06l1.95 1.898z" />
    </svg>
  </template>
  
  <script>
  export default {
    name: 'IconCheck',
    props: {
      size: {
        type: [String, Number],
        default: 20
      },
      color: {
        type: String,
        default: 'white'
      }
    }
  }
  </script>
  