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

      <!-- AI 助手配置面板 -->
      <div class="mb-4 bg-white border border-indigo-200 rounded-xl shadow-sm overflow-hidden">
        <!-- 标题行 -->
        <div class="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-200">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <span class="text-sm font-semibold text-indigo-700">AI 助手配置</span>
            <span
              :class="[
                'text-xs px-2 py-0.5 rounded-full font-medium',
                aiMode === 'mock'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              ]"
            >{{ AI_PROVIDER_LABELS[aiMode] ?? aiMode }}</span>
          </div>
          <span class="text-xs text-gray-400">快捷键：<kbd class="font-mono bg-white border rounded px-1">Ctrl+Shift+A</kbd></span>
        </div>

        <!-- 配置主体 -->
        <div class="px-4 py-3 flex flex-wrap items-end gap-4">
          <!-- 提供商选择 -->
          <div class="flex flex-col gap-1 min-w-36">
            <label class="text-xs font-medium text-gray-500">AI 提供商</label>
            <select
              v-model="aiMode"
              @change="rebuildAIService"
              class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="ollama">Ollama（本地）</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="google">Google AI (Gemini)</option>
              <option value="mock">Mock（演示）</option>
            </select>
          </div>

          <!-- Ollama 配置 -->
          <template v-if="aiMode === 'ollama'">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">模型</label>
              <input
                v-model="ollamaModel"
                @blur="rebuildAIService"
                type="text"
                placeholder="llama3.2"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-36"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">服务地址</label>
              <input
                v-model="ollamaBaseUrl"
                @blur="rebuildAIService"
                type="text"
                placeholder="http://localhost:11434"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
          </template>

          <!-- OpenAI 配置 -->
          <template v-if="aiMode === 'openai'">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">模型</label>
              <input
                v-model="openaiModel"
                @blur="rebuildAIService"
                type="text"
                placeholder="gpt-4o-mini"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-36"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">API Key</label>
              <input
                v-model="openaiApiKey"
                @blur="rebuildAIService"
                type="password"
                placeholder="sk-..."
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">Base URL（可选）</label>
              <input
                v-model="openaiBaseUrl"
                @blur="rebuildAIService"
                type="text"
                placeholder="https://api.openai.com/v1"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60"
              />
            </div>
          </template>

          <!-- Anthropic 配置 -->
          <template v-if="aiMode === 'anthropic'">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">模型</label>
              <input
                v-model="anthropicModel"
                @blur="rebuildAIService"
                type="text"
                placeholder="claude-3-5-haiku-latest"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">API Key</label>
              <input
                v-model="anthropicApiKey"
                @blur="rebuildAIService"
                type="password"
                placeholder="sk-ant-..."
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
          </template>

          <!-- Google AI 配置 -->
          <template v-if="aiMode === 'google'">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">模型</label>
              <input
                v-model="googleModel"
                @blur="rebuildAIService"
                type="text"
                placeholder="gemini-2.0-flash"
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">API Key</label>
              <input
                v-model="googleApiKey"
                @blur="rebuildAIService"
                type="password"
                placeholder="AIza..."
                class="h-8 px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
          </template>

          <!-- Mock 说明 -->
          <p v-if="aiMode === 'mock'" class="text-xs text-amber-600 leading-relaxed self-center">
            Mock 模式仅供演示，不调用真实 AI 服务。<br/>
            切换到其他提供商可体验真实 AI 功能。
          </p>
        </div>
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
import { createAIService } from '@my-editor/rich-text-editor'

// 响应式数据
const content = ref('')
const showPreview = ref(false)
const editorRef = ref(null)
const showEditor = ref(true)
const editorKey = ref(0)
const notionModeActive = ref(false)

// ─── AI 服务配置 ──────────────────────────────────────────────────────────────

/** 提供商标签映射 */
const AI_PROVIDER_LABELS = {
  ollama: 'Ollama 本地',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google AI',
  mock: 'Mock 演示',
}

/** 当前选择的提供商 */
const aiMode = ref('ollama')

// Ollama
const ollamaModel = ref('llama3.2')
const ollamaBaseUrl = ref('http://localhost:11434')

// OpenAI
const openaiModel = ref('gpt-4o-mini')
const openaiApiKey = ref('')
const openaiBaseUrl = ref('')

// Anthropic
const anthropicModel = ref('claude-3-5-haiku-latest')
const anthropicApiKey = ref('')

// Google AI
const googleModel = ref('gemini-2.0-flash')
const googleApiKey = ref('')

/**
 * Mock AI 实现（演示用，不依赖任何外部服务）。
 */
async function mockAIAction(actionId, ctx) {
  await new Promise(r => setTimeout(r, 600))
  const text = ctx.selectedText || ctx.blockText || '（无内容）'
  const map = {
    'improve':     `[优化后] ${text}`,
    'fix-grammar': `[已修正语法] ${text}`,
    'summarize':   `[摘要] ${text.slice(0, 40)}…`,
    'expand':      `${text}\n\n（此处是对上述内容的进一步展开与补充说明。）`,
    'translate':   `[Translation] ${text}`,
    'continue':    `${text}\n\n（这是 AI 续写的内容，请在此基础上继续编辑。）`,
  }
  if (actionId.startsWith('custom:')) {
    return `[自定义指令 "${actionId.slice(7)}"] ${text}`
  }
  return map[actionId] ?? `[${actionId}] ${text}`
}

/**
 * 构建 AI 选项。
 * createAIService 返回的 execute 方法签名与 AIOptions.onAIAction 完全一致，
 * 可直接赋值，无需任何适配层。
 */
function buildAIOptions() {
  const mode = aiMode.value

  if (mode === 'ollama') {
    const aiService = createAIService({
      providerConfig: {
        provider: 'ollama',
        model: ollamaModel.value || 'llama3.2',
        baseUrl: ollamaBaseUrl.value || 'http://localhost:11434',
      },
    })
    return { onAIAction: aiService.execute, promptPlaceholder: '例如：将这段话改写得更正式…' }
  }

  if (mode === 'openai') {
    const aiService = createAIService({
      providerConfig: {
        provider: 'openai',
        model: openaiModel.value || 'gpt-4o-mini',
        ...(openaiApiKey.value && { apiKey: openaiApiKey.value }),
        ...(openaiBaseUrl.value && { baseURL: openaiBaseUrl.value }),
      },
    })
    return { onAIAction: aiService.execute, promptPlaceholder: '例如：将这段话改写得更正式…' }
  }

  if (mode === 'anthropic') {
    const aiService = createAIService({
      providerConfig: {
        provider: 'anthropic',
        model: anthropicModel.value || 'claude-3-5-haiku-latest',
        ...(anthropicApiKey.value && { apiKey: anthropicApiKey.value }),
        maxTokens: 2048,
      },
    })
    return { onAIAction: aiService.execute, promptPlaceholder: '例如：将这段话改写得更正式…' }
  }

  if (mode === 'google') {
    const aiService = createAIService({
      providerConfig: {
        provider: 'google',
        model: googleModel.value || 'gemini-2.0-flash',
        ...(googleApiKey.value && { apiKey: googleApiKey.value }),
      },
    })
    return { onAIAction: aiService.execute, promptPlaceholder: '例如：将这段话改写得更正式…' }
  }

  // Mock 模式
  return {
    onAIAction: mockAIAction,
    promptPlaceholder: '例如：将这段话改写得更正式… (Mock 模式)',
  }
}

const aiOptions = ref(buildAIOptions())

/** 重建 AI 服务并热刷新编辑器 */
function rebuildAIService() {
  const savedContent = editorRef.value?.getHTML() || content.value
  aiOptions.value = buildAIOptions()
  editorKey.value++
  setTimeout(() => {
    if (savedContent && editorRef.value) {
      editorRef.value.setHTML(savedContent)
    }
  }, 50)
}

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
