<script setup>
import { computed, ref } from "vue"
import nested from "./nested.vue"
const props = defineProps(["item", "ctx"])
const emit = defineEmits(["mount"])
const curroot = ref();
const notEmpty=(...str)=>{
    for(let sk in str){
        let s=str[sk]
        if(s!=undefined && !s.length == 0) return s;
    }
}
const title = computed(() => {
    return notEmpty(props?.item?.value?.title ,props?.item?.value?.title,props?.item?.title , "-Title-")
})
const line = computed(() => {
    return props?.item?.value?.line ??props?.item?.line?? " "
})
const toGenerate = () => {
    (props?.item?.value ?? props.item)?.expand?.(props.ctx)
}
const toMount = () => {
    emit("mount", props.item.value?? props.item, props.ctx,curroot.value.getBoundingClientRect().left,curroot.value.getBoundingClientRect().top)
}
const getChildren = () => {
    return props?.item?.value?.slot?.value ?? props?.item?.slot?.value ?? []
}
const expanded=ref(false);
const foldfn=()=>{
    if(getChildren().length<=0){
        toGenerate();
    }
    expanded.value=!expanded.value;
}

</script>
<template>
    <div class="nest" ref="curroot">
        <div class="nest-title">
            <button @click="foldfn">{{ expanded?"-":"+" }}</button>
           {{ title }} <button @click="toGenerate">↻</button><button @click="toMount"> &lt;-</button></div>
        <div class="nest-line"> {{ line }}</div>
        <div class="nest-slot" v-if="getChildren().length>0 && expanded">
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