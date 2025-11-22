<script setup>
import { getCurrentInstance, reactive } from "vue"
import nested from './components/nested.vue'
import Sidebar from './components/sidebar.vue'  // 引入侧边栏组件
import { createNest, createContext, wrap, makeByJson } from "./core.js"
let ctx = reactive({
  ...createContext(),
  root: null,
  curent: null
});
const handleMount = (item, _c, left, top) => {
  ctx.current = item;
}
const recvObj = (thes) => {
  ctx.root = thes
  ctx.current = thes
}
recvObj(createNest());

const handleSourceLoaded = (sourceData) => {
  try {
    recvObj(wrap(makeByJson(sourceData.data)))
  } catch (e) {
    console.error(e)
  }
  getCurrentInstance?.()?.$forceUpdate?.()
}
</script>

<template>
  <nested :item="ctx.current" :ctx="createContext()" @mount="handleMount" id="root" ref="root"></nested>
  <Sidebar :info="ctx.current" @source-loaded="handleSourceLoaded" />
</template>
