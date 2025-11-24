<template>
    <div>
        <div class="trigger-area" @mouseenter="activateSidebar" @mouseleave="deactivateSidebar"></div>

        <div class="sidebar" :class="{ active: sidebarActive }" @mouseenter="activateSidebar"
            @mouseleave="deactivateSidebar">

            <div class="sidebar-header">
                <h2 class="sidebar-title">Import</h2>
            </div>

            <div class="sidebar-content">
                <div class="sidebar-item" @click="triggerFileInput">
                    <span>JSON File</span>
                    <input type="file" ref="fileInput" accept=".json" @change="handleFileUpload" style="display: none;">
                </div>

                <div class="sidebar-item" @click="showExternalInput = !showExternalInput">
                    <span>External Source</span>
                </div>

                <div v-if="showExternalInput" class="external-input-group">
                    <div class="input-row">
                        <label class="input-label">Source:</label>
                        <select v-model="selectedSource" class="combobox">
                            <option value="textdb">TextDB</option>
                        </select>
                    </div>

                    <div class="input-row">
                        <label class="input-label">path:</label>
                        <input type="text" v-model="externalId" class="lineedit" @keyup.enter="loadFromExternal">
                    </div>

                    <button @click="loadFromExternal" class="submit-btn" :disabled="loading">
                        {{ loading ? 'Loading...' : 'Submit' }}
                    </button>
                </div>

                <div class="sidebar-item" @click="showBase64Input = !showBase64Input">
                    <span>Base64</span>
                </div>
                <div v-if="showBase64Input" class="input-group">
                    <textarea v-model="base64Data" placeholder="Base64 format" class="textarea-field"></textarea>
                    <button @click="loadFromBase64" class="action-btn">Decode</button>
                </div>

                <div v-if="loading" class="status-message loading">Loading...</div>
                <div v-if="error" class="status-message error">Error: {{ error }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

import { from_text_db } from '../network.js'

const emits = defineEmits(['source-loaded'])

const sidebarActive = ref(false)
let sidebarTimeout = null
const showExternalInput = ref(false)
let base64Data = ref()
const showBase64Input = ref(false)
const fileInput = ref(null)
const loading = ref(false)
const error = ref('')

const selectedSource = ref('textdb')
const externalId = ref('')

const activateSidebar = () => {
    if (sidebarTimeout) {
        clearTimeout(sidebarTimeout)
        sidebarTimeout = null
    }
    sidebarActive.value = true
}

const deactivateSidebar = () => {
    sidebarTimeout = setTimeout(() => {
        sidebarActive.value = false
    }, 300)
}

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    loading.value = true
    error.value = ''

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const content = e.target.result
            const data = JSON.parse(content)
            emits('source-loaded', {
                type: 'json-file',
                data: data,
                filename: file.name,
                timestamp: new Date()
            })
            resetInputs()
        } catch (err) {
            error.value = 'Bad JSON file format :' + err.message
        } finally {
            loading.value = false
        }
    }

    reader.onerror = () => {
        error.value = 'failed reading file.'
        loading.value = false
    }

    reader.readAsText(file)
}

const loadFromExternal = async () => {
    if (!externalId.value.trim()) {
        error.value = 'Data path needed!'
        return
    }

    loading.value = true
    error.value = ''

    try {
        let data

        switch (selectedSource.value) {
            case 'textdb':
                data = await from_text_db(externalId.value.trim())
                console.log("data is ", data)
                break
            default:
                throw new Error('Unknown external source')
        }

        let parsedData
        try {
            parsedData = JSON.parse(data)
        } catch {
            parsedData = data
        }

        emits('source-loaded', {
            type: 'external',
            data: parsedData,
            source: selectedSource.value,
            identifier: externalId.value.trim(),
            timestamp: new Date()
        })

        resetInputs()
    } catch (err) {
        error.value = `${selectedSource.value}Failed loading from :${selectedSource.value} ` + err.message
    } finally {
        loading.value = false
    }
}

const loadFromBase64 = () => {
    if (!base64Data.value) {
        error.value = 'Base64 format data is needed!'
        return
    }

    loading.value = true
    error.value = ''

    try {
        const decodedString = decodeURIComponent(escape(atob(base64Data.value)))
        const data = JSON.parse(decodedString)

        emits('source-loaded', {
            type: 'base64',
            data: data,
            timestamp: new Date()
        })
        resetInputs()
    } catch (err) {
        error.value = 'Parsing failed: ' + err.message
    } finally {
        loading.value = false
    }
}

const resetInputs = () => {
    externalId.value = ''
    base64Data.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    showExternalInput.value = false
    showBase64Input.value = false
    error.value = ''
}
</script>

<style scoped>

</style>