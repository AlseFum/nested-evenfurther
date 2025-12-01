<template>
    <div>
        <div class="trigger-area" @mouseenter="activateSidebar" @mouseleave="deactivateSidebar">
            <div class="sidebar" :class="{ active: sidebarActive }" @mouseenter="activateSidebar"
                @mouseleave="deactivateSidebar">

                <div class="sidebar-header">
                    <h2 class="sidebar-title">Import</h2>
                </div>

                <div class="sidebar-content">
                    <div class="sidebar-item" style="display:block" @click="showTextInput = !showTextInput">
                        <span>Input</span>
                        <br />
                        <div v-if="showTextInput" style="display:flex;width:100%;flex-direction: column;">
                            <textarea v-model="textInput" rows="5" @click.stop class="sidebar-textarea"></textarea>

                            <button @click.stop="loadFromInput">click</button>
                        </div>

                    </div>

                    <div class="sidebar-item" @click="triggerFileInput">
                        <span>JSON File</span>
                        <input type="file" ref="fileInput" accept=".json" @change="loadFromFile" style="display: none;">
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

                    <div v-if="loading" class="status-message loading">Loading...</div>
                    <div v-if="error" class="status-message error">Error: {{ error }}</div>
                </div>
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
const showTextInput = ref(false);
const textInput = ref(JSON.stringify({ nested: { title: "Nested", slot: ["nested"] } }));
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

const handleText = (text) => {
    const base64ToPlain = (text) => {
        const isValidBase64 = (str) => {
            if (typeof str !== 'string' || !str) return false;
            const cleanStr = str.trim();
            if (cleanStr.length % 4 !== 0) return false;
            const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
            return base64Pattern.test(cleanStr);
        };

        const decodeBase64 = (base64Str) => {
            const cleanStr = base64Str.trim();
            if (!isValidBase64(cleanStr)) {
                return false;
            };
            return decodeURIComponent(
                atob(cleanStr).split('').map(char =>
                    '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
        };
        if (typeof text !== 'string') {
            return false;
        }
        const input = text.trim();
        if (input === '') {
            return false;
        }
        if (isValidBase64(input)) {
            return decodeBase64(input);
        }
        return false;
    };
    let b64 = base64ToPlain(text)
    return JSON.parse(b64 ? b64 : text)
}
const loadFromInput = (e) => {
    const text = textInput.value;
    emits('source-loaded', {
        type: 'json-file',
        data: handleText(text),
        filename: "",
        timestamp: new Date()
    })
    return;
}
const triggerFileInput = () => {
    fileInput.value?.click()
}
const loadFromFile = (event) => {
    const file = event.target.files[0]
    if (!file) return

    loading.value = true
    error.value = ''

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            emits('source-loaded', {
                type: 'json-file',
                data: handleText(content),
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
                break
            default:
                throw new Error('Unknown external source')
        }

        let parsedData
        try {
            parsedData = handleText(data)
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

const resetInputs = () => {
    externalId.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    showExternalInput.value = false
    error.value = ''
}
</script>