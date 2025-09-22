<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">
        富文本编辑器
      </h1>
      
      <!-- 富文本编辑器 -->
      <VanillaRichTextEditor 
        ref="editorRef"
        v-if="showEditor"
        v-model="content" 
        :show-toolbar="true"
        :toolbar-options="toolbarOptions"
        @focus="handleFocus"
        @blur="handleBlur"
        @selectionUpdate="handleSelectionUpdate"
      />
      
      <!-- 内容预览区域（可选） -->
       <div v-if="showPreview && content" class="mt-8">
         <h2 class="text-2xl font-semibold text-gray-700 mb-4">内容预览</h2>
         <div class="bg-white rounded-lg shadow-lg p-6 prose prose-lg max-w-none" v-html="content"></div>
       </div>
       
       <!-- 控制按钮 -->
       <div class="mt-6 flex justify-center gap-4">
         <button 
           @click="showPreview = !showPreview"
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
         >
           {{ showPreview ? '隐藏预览' : '显示预览' }}
         </button>
        <button 
          @click="exportContent"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          导出HTML
        </button>
        <button 
          @click="clearContent"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          清空内容
        </button>
        <button 
          @click="toggleToolbar"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          切换工具栏
        </button>
        <button 
          @click="showEditor = !showEditor"
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          切换编辑器
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VanillaRichTextEditor from './components/editor/VanillaRichTextEditor.vue'

// 响应式数据
const content = ref('')
const showPreview = ref(false)
const editorRef = ref(null)
const showEditor = ref(true)

// 工具栏配置
const toolbarOptions = ref({
  showTextFormat: true,
  showHeadings: true,
  showLists: true,
  showBlocks: true,
  showMedia: true,
  showColors: true,
  showTables: true,
  customButtons: [
    {
      id: 'custom-undo',
      label: '↶ 撤销',
      title: '撤销',
      onClick: () => editorRef.value?.undo(),
      isDisabled: () => !editorRef.value?.canUndo()
    },
    {
      id: 'custom-redo',
      label: '↷ 重做',
      title: '重做',
      onClick: () => editorRef.value?.redo(),
      isDisabled: () => !editorRef.value?.canRedo()
    }
  ]
})

// 处理焦点事件
const handleFocus = () => {
  // 编辑器获得焦点
}

const handleBlur = () => {
  // 编辑器失去焦点
}

const handleSelectionUpdate = (selection) => {
  // 选择更新处理
}

// 导出内容
const exportContent = () => {
  if (content.value) {
    const blob = new Blob([content.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rich-text-content.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    alert('没有内容可导出')
  }
}

// 清空内容
const clearContent = () => {
  if (confirm('确定要清空所有内容吗？')) {
    editorRef.value?.clear()
  }
}

// 切换工具栏
const toolbarVisible = ref(true)
const toggleToolbar = () => {
  if (editorRef.value) {
    if (toolbarVisible.value) {
      // 隐藏工具栏
      editorRef.value.hideToolbar()
      toolbarVisible.value = false
    } else {
      // 显示工具栏
      editorRef.value.showToolbar()
      toolbarVisible.value = true
    }
  }
}
</script>