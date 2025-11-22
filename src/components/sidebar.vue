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
                        <input 
                            type="text" 
                            v-model="externalId" 
                            class="lineedit"
                            @keyup.enter="loadFromExternal"
                        >
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
let base64Data=ref()
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
                console.log("data is ",data)
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
.external-input-group {
    margin: 10px 0;
    padding: 15px;
    background: #3a506b;
    border-radius: 8px;
}

.input-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.input-label {
    width: 80px;
    font-size: 0.9em;
    color: #bdc3c7;
    margin-right: 10px;
}

.lineedit {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #4a6491;
    border-radius: 4px;
    background: #2c3e50;
    color: white;
    font-size: 0.9em;
}

.lineedit:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.combobox {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #4a6491;
    border-radius: 4px;
    background: #2c3e50;
    color: white;
    font-size: 0.9em;
    cursor: pointer;
}

.combobox:focus {
    outline: none;
    border-color: #3498db;
}

.submit-btn {
    width: 100%;
    padding: 10px;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    height:1.5em;
    font-weight: 500;
    transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #219a52;
}

.submit-btn:disabled {
    background: #7f8c8d;
    cursor: not-allowed;
}

/* 原有的其他样式保持不变 */
.input-group {
    margin: 10px 0;
    padding: 10px;
    background: #3a506b;
    border-radius: 6px;
}

.textarea-field {
    width: 100%;
    height: 80px;
    padding: 8px;
    margin-bottom: 8px;
    border: 1px solid #4a6491;
    border-radius: 4px;
    background: #2c3e50;
    color: white;
    resize: vertical;
    font-family: monospace;
}

.action-btn {
    width: 100%;
    padding: 8px;
    background: #3498db;
    color: white;
    border: none;
    height:1.5em;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.action-btn:hover {
    background: #2980b9;
}

.status-message {
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9em;
}

.status-message.loading {
    background: #34495e;
    color: #3498db;
}

.status-message.error {
    background: #c0392b;
    color: white;
}

.sidebar-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    margin-bottom: 10px;
    background: #34495e;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.sidebar-item:hover {
    background: #3498db;
}

/* 保留原有的样式 */
.trigger-area {
    position: fixed;
    top: 0;
    right: 0;
    width: 40px;
    height: 100vh;
    z-index: 998;
    background: transparent;
}

.sidebar {
    position: fixed;
    top: 0;
    right: -300px;
    width: 300px;
    height: 100vh;
    background: #2c3e50;
    color: white;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 999;
    transition: right 0.3s ease-in-out;
    padding: 20px;
    overflow-y: auto;
}

.sidebar.active {
    right: 0;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #34495e;
}

.sidebar-title {
    font-size: 1.5rem;
    font-weight: 600;
}

.sidebar-content {
    padding: 10px 0;
}
</style>