<script setup>
import { computed, ref ,getCurrentInstance} from "vue"
import nested from "./nested.vue"
const props = defineProps(["item", "ctx"])
const emit = defineEmits(["mount"])
const curroot = ref();
const notEmpty = (...str) => {
    for (let sk in str) {
        let s = str[sk]
        if (s != undefined && !s.length == 0) return s;
    }
}
const title = computed(() => {
    return notEmpty(props?.item?.value?.title, props?.item?.value?.title, props?.item?.title, "-Title-")
})
const line = computed(() => {
    return props?.item?.value?.line ?? props?.item?.line ?? " "
})
const obj2propArr = (obj, prefix = '') => {
  if (obj == null || typeof obj !== 'object') {return [];}
  let result = [];
  Object.entries(obj).forEach(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      result = result.concat(obj2propArr(value, currentKey));
    } else {
      result.push({ key: currentKey, value });
    }
  });
  return result;
};
const propArr = computed(() => {
    return obj2propArr(props?.item?.value?.prop ?? props?.item?.prop) ?? []
})
const toGenerate = () => {
    (props?.item?.value ?? props.item)?.expand?.(props.ctx);
    getCurrentInstance()?.forceUpdate?.()
}
const toMount = () => {
    emit("mount", props.item.value ?? props.item, props.ctx, curroot.value.getBoundingClientRect().left, curroot.value.getBoundingClientRect().top)
}
const getChildren = () => {
    return props?.item?.value?.slot?.value ?? props?.item?.slot?.value ?? []
}
const expanded = ref(false);
const justfold=()=>{
    expanded.value=!expanded.value
}
defineExpose({justfold})
const foldfn = () => {
    if (getChildren().length <= 0) {
        toGenerate();
    }
    expanded.value = !expanded.value;
}

</script>
<template>
    <div class="nest" ref="curroot">
        <div class="nest-title">
            <button @click="foldfn">{{ expanded ? "-" : "+" }}</button>
            {{ title }}
            <button @click="toGenerate">↻</button>
            <button @click="toMount"> &lt;-</button>
        </div>
        <div style="margin-left:24px;" v-if="expanded">
            <div class="nest-line"> {{ line }}</div>
            <div class="nest-props" v-if="propArr.length>0">
                <div v-for="s in propArr" class="nest-prop">{{ s?.key }} : {{ s?.value }}</div>
            </div>
            <div class="nest-slot" v-if="getChildren().length > 0 ">
                <div v-for="s in getChildren()">
                    <nested :item="s" :ctx="props.ctx" @mount="(a, b, c, d) => emit('mount', a, b, c, d)"></nested>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
button {
    height: 20px;
    border-radius: 1px;
}
</style>