<template>
  <div class="vanilla-rich-text-editor">
    <div ref="editorContainer" class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 工具栏将通过 JavaScript 动态插入 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RichTextEditor } from '@my-editor/rich-text-editor'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '开始编写你的内容...'
  },
  editable: {
    type: Boolean,
    default: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  toolbarOptions: {
    type: Object,
    default: () => ({})
  },
  mentionOptions: {
    type: Object,
    default: undefined
  },
  slashCommandOptions: {
    type: Object,
    default: undefined
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'selectionUpdate'])

// Refs
const editorContainer = ref(null)
let editor = null
let toolbar = null

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return

  // 创建编辑器（包含工具栏）
  editor = new RichTextEditor(editorContainer.value, {
    content: props.modelValue || '<p></p>',
    placeholder: props.placeholder,
    editable: props.editable,
    showToolbar: props.showToolbar,
    toolbarOptions: props.toolbarOptions,
    mentionOptions: props.mentionOptions,
    slashCommandOptions: props.slashCommandOptions,
    onUpdate: (content) => {
      emit('update:modelValue', content)
    },
    onFocus: () => {
      emit('focus')
    },
    onBlur: () => {
      emit('blur')
    },
    onSelectionUpdate: (selection) => {
      emit('selectionUpdate', selection)
    }
  })
}

// 销毁编辑器
const destroyEditor = () => {
  if (editor) {
    editor.destroy()
    editor = null
  }
}

// 监听内容变化
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getHTML()) {
    editor.setHTML(newValue)
  }
})

// 监听可编辑状态变化
watch(() => props.editable, (newValue) => {
  if (editor) {
    editor.setEditable(newValue)
  }
})

// 监听工具栏选项变化
watch(() => props.toolbarOptions, (newOptions) => {
  if (editor && newOptions) {
    editor.updateToolbar(newOptions)
  }
}, { deep: true })

// 暴露方法给父组件（不暴露编辑器实例）
const getHTML = () => editor?.getHTML() || ''
const setHTML = (content) => editor?.setHTML(content)
const getText = () => editor?.getText() || ''
const setText = (text) => editor?.setText(text)
const clear = () => editor?.clear()
const focus = () => editor?.focus()
const blur = () => editor?.blur()
const isEmpty = () => editor?.isEmpty() || true
const isFocused = () => editor?.isFocused() || false
const isEditable = () => editor?.isEditable() || false
const undo = () => editor?.undo()
const redo = () => editor?.redo()
const canUndo = () => editor?.canUndo() || false
const canRedo = () => editor?.canRedo() || false
const showToolbar = () => editor?.showToolbar()
const hideToolbar = () => editor?.hideToolbar()
const updateToolbar = (options) => editor?.updateToolbar(options)

// 暴露给父组件
defineExpose({
  getHTML,
  setHTML,
  getText,
  setText,
  clear,
  focus,
  blur,
  isEmpty,
  isFocused,
  isEditable,
  undo,
  redo,
  canUndo,
  canRedo,
  showToolbar,
  hideToolbar,
  updateToolbar
})

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  destroyEditor()
})
</script>

<style scoped>
.vanilla-rich-text-editor {
  @apply w-full;
}
</style>
