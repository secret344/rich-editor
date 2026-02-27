<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-2">
        富文本编辑器
      </h1>
      <p class="text-center text-gray-500 text-sm mb-8">
        支持 Mention(@提及)、斜杠命令(/)、音视频、全屏、Notion 模式、AI 助手等功能
      </p>

      <!-- Notion 模式切换 -->
      <div class="flex justify-center mb-4">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <span class="text-sm text-gray-600 font-medium">Notion 模式</span>
          <button
            @click="toggleNotionMode"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              notionModeActive ? 'bg-blue-600' : 'bg-gray-300'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                notionModeActive ? 'translate-x-6' : 'translate-x-1'
              ]"
            ></span>
          </button>
          <span v-if="notionModeActive" class="text-xs text-blue-600 font-medium">已启用（悬停块左侧可见操作菜单）</span>
        </label>
      </div>

      <!-- AI 助手提示 -->
      <div class="flex justify-center mb-4">
        <p class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
          ✨ AI 助手已启用：选中文本后点击右侧"✨ AI"按钮，或使用快捷键 <kbd class="font-mono bg-white border rounded px-1">Ctrl+Shift+A</kbd> 打开 AI 面板
        </p>
      </div>
      
      <!-- 富文本编辑器 -->
      <VanillaRichTextEditor 
        ref="editorRef"
        :key="editorKey"
        v-if="showEditor"
        v-model="content" 
        :show-toolbar="true"
        :toolbar-options="toolbarOptions"
        :mention-options="mentionOptions"
        :slash-command-options="slashCommandOptions"
        :notion-mode="notionModeActive"
        :ai-options="aiOptions"
        @focus="handleFocus"
        @blur="handleBlur"
        @selectionUpdate="handleSelectionUpdate"
      />
      
      <!-- 内容预览区域 -->
      <div v-if="showPreview && content" class="mt-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">内容预览</h2>
        <div class="bg-white rounded-lg shadow-lg p-6 prose prose-lg max-w-none" v-html="content"></div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button 
          @click="showPreview = !showPreview"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </button>
        <button 
          @click="exportContent"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          导出HTML
        </button>
        <button 
          @click="clearContent"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          清空内容
        </button>
        <button 
          @click="toggleToolbar"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          切换工具栏
        </button>
        <button 
          @click="showEditor = !showEditor"
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
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
const editorKey = ref(0)
const notionModeActive = ref(false)

// 工具栏配置
const toolbarOptions = ref({
  showTextFormat: true,
  showHeadings: true,
  showLists: true,
  showBlocks: true,
  showMedia: true,
  showVideo: true,
  showAudio: true,
  showColors: true,
  showTables: true,
  showEmoji: true,
  showFullscreen: true,
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

// Mention 配置（@提及功能）
const mentionOptions = ref({
  char: '@',
  items: [
    { id: '1', label: '张三' },
    { id: '2', label: '李四' },
    { id: '3', label: '王五' },
    { id: '4', label: '赵六' },
    { id: '5', label: 'Alice' },
    { id: '6', label: 'Bob' },
  ],
  onMentionSelect: (item) => {
    console.log('选中用户:', item)
  }
})

// Slash 命令配置（类 Notion 模式）
const slashCommandOptions = ref({
  includeDefaults: true,
  // 可以添加自定义命令
  items: []
})

// AI 助手配置
// onAIAction 是一个 mock 实现，实际使用时替换为真实 AI API 调用
const aiOptions = ref({
  includeDefaultActions: true,
  promptPlaceholder: '例如：将这段话改写得更正式…',
  onAIAction: async (actionId, ctx) => {
    // ── Mock AI 响应（演示用）──────────────────────────────────────────────
    // 在实际项目中，将此处替换为对 OpenAI / 自建 AI 服务的 fetch 调用，例如：
    //
    //   const res = await fetch('/api/ai', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ action: actionId, text: ctx.selectedText }),
    //   })
    //   const data = await res.json()
    //   return data.result
    //
    await new Promise(r => setTimeout(r, 800)) // 模拟网络延迟

    const text = ctx.selectedText || ctx.blockText || '（无内容）'
    const map = {
      'improve':      `[优化后] ${text}`,
      'fix-grammar':  `[已修正语法] ${text}`,
      'summarize':    `[摘要] ${text.slice(0, 40)}…`,
      'expand':       `${text}\n\n（此处是对上述内容的进一步展开与补充说明。）`,
      'translate':    `[Translation] ${text}`,
      'continue':     `${text}\n\n（这是 AI 续写的内容，请在此基础上继续编辑。）`,
    }
    if (actionId.startsWith('custom:')) {
      const prompt = actionId.slice(7)
      return `[自定义指令 "${prompt}"] ${text}`
    }
    return map[actionId] ?? `[${actionId}] ${text}`
  }
})

const handleFocus = () => {}
const handleBlur = () => {}
const handleSelectionUpdate = () => {}

const toggleNotionMode = () => {
  // 重新挂载编辑器以切换 notion 模式
  const savedContent = editorRef.value?.getHTML() || content.value
  notionModeActive.value = !notionModeActive.value
  editorKey.value++
  // 下一个 tick 后还原内容
  setTimeout(() => {
    if (savedContent && editorRef.value) {
      editorRef.value.setHTML(savedContent)
    }
  }, 50)
}

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

const clearContent = () => {
  if (confirm('确定要清空所有内容吗？')) {
    editorRef.value?.clear()
  }
}

const toolbarVisible = ref(true)
const toggleToolbar = () => {
  if (editorRef.value) {
    if (toolbarVisible.value) {
      editorRef.value.hideToolbar()
      toolbarVisible.value = false
    } else {
      editorRef.value.showToolbar()
      toolbarVisible.value = true
    }
  }
}
</script>
