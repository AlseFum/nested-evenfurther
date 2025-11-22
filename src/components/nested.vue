<script setup>
import { computed, ref } from "vue"
import nested from "./nested.vue"
const props = defineProps(["item", "ctx"])
const emit = defineEmits(["mount"])
const curroot = ref();
const title = computed(() => {
    console.log(props.item)
    return props?.item?.value?.title ??props?.item?.title ?? "-Title-"
})
const line = computed(() => {
    return props?.item?.value?.line ??props?.item?.line?? " "
})
const toExpand = () => {
    (props?.item?.value ?? props.item)?.expand?.(props.ctx)
}
const toMount = () => {
    emit("mount", props.item.value?? props.item, props.ctx,curroot.value.getBoundingClientRect().left,curroot.value.getBoundingClientRect().top)
}
const getChildren = () => {
    return props?.item?.value?.slot?.value ?? props?.item?.slot?.value ?? []

}
</script>
<template>
    <div class="nest" ref="curroot">
        <div class="nest-title"><button @click="toExpand">+</button>{{ title }}<button @click="toMount"> &lt;-</button></div>
        <div class="nest-line"> {{ line }}</div>

        
        <div class="nest-slot" v-if="getChildren().length>0">
            <div v-for="s in getChildren()">
                <nested :item="s" :ctx="props.ctx" @mount="(a,b,c,d)=>emit('mount', a,b,c,d)"></nested>
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