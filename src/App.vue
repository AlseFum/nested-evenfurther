<script setup>
import { getCurrentInstance, reactive, ref } from "vue"
import nested from './components/nested.vue'
import Sidebar from './components/sidebar.vue'  // 引入侧边栏组件
import { createNest, createContext, wrap, makeByJson } from "./core.js"
let ctx = reactive({
  ...createContext(),
  root: null,
  curent: null
});
const mountItem = (thes) => {
  ctx.root = thes
  ctx.current = thes
}
mountItem(createNest());
//----Animation
const overlayPos = ref({ left: 321, top: 321 })
const overlayItem = ref();
const root=ref()
const overlayDisplay = ref('none');
const position = ref({ x: 0, y: 0, op: 1 })
const handleMount = (item, _c, left, top) => {
  overlayDisplay.value = "block";
  overlayPos.value.left = left;
  overlayPos.value.top = top;
  overlayItem.value = item;
  startmove(-left, -top, 0, () => {
    overlayDisplay.value = "none"
    ctx.current = item;
    root.value.justfold();
  })
}
const startmove = (targetX, targetY, targetOP, thenfn) => {
  let moving = { yes: true }
  const startTime = performance.now()
  const duration = 1000 // 动画时长1秒
  const startX = position.value.x
  const startY = position.value.y
  const startOP = position.value.op

  const animate = (currentTime) => {
    if (!moving.yes) return

    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数让动画更丝滑
    const ease = 1 - Math.pow(1 - progress, 3) // 三次方缓动

    position.value.x = startX + (targetX - startX) * ease
    position.value.y = startY + (targetY - startY) * ease
    position.value.op = startOP + (targetOP - startOP) * ease
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      moving.yes = false
      position.value.x = 0
      position.value.y = 0
      position.value.op = 1;
      thenfn()
    }
  }

  requestAnimationFrame(animate)
}
//----Extern
const handleSourceLoaded = (sourceData) => {
  mountItem(wrap(makeByJson(sourceData.data)))
  getCurrentInstance?.()?.$forceUpdate?.()
}


</script>

<template>
  <nested :item="overlayItem"
    :style="{ display: overlayDisplay, opacity: 1, transform: `translate(${position.x}px, ${position.y}px)`, zIndex: 133, position: 'fixed', left: `${overlayPos.left}px`, top: `${overlayPos.top}px` }">
  </nested>
  <nested :item="ctx.current" :ctx="createContext()" @mount="handleMount" id="root" ref="root"
    :style="{opacity:position.op,transform: `translate(${position.x}px, ${position.y}px)` }"></nested>

<Sidebar :info="ctx.current" @source-loaded="handleSourceLoaded" /></template>
