<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'

import Button from '@/components/ui/button/Button.vue'
import Spinner from "@/components/ui/spinner/Spinner.vue"
import TaskAddForm from "@/components/task/TaskAddForm.vue"
import TaskItem from "@/components/task/TaskItem.vue"
import TaskEditForm from "@/components/task/TaskEditForm.vue"
import { TaskService } from "@/services/taskService"
import { TaskStatus, TaskPriority } from "@/services/taskService"
import type { Task, TaskCounts } from "@/services/taskService"
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { GripVerticalIcon, ArrowUpDownIcon, CheckIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-vue-next'

type Filter = 'All' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
const filters: Filter[] = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled']
const activeFilter = ref<Filter>('All')

const apiFilterMap: Record<Filter, TaskStatus | 'all'> = {
  'All': 'all',
  'Pending': TaskStatus.PENDING,
  'In Progress': TaskStatus.IN_PROGRESS,
  'Completed': TaskStatus.COMPLETED,
  'Cancelled': TaskStatus.CANCELLED
}

type PriorityFilter = 'all' | TaskPriority
const priorityFilters: { label: string; value: PriorityFilter }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'Low', value: TaskPriority.LOW },
  { label: 'Medium', value: TaskPriority.MEDIUM },
  { label: 'High', value: TaskPriority.HIGH }
]
const activePriority = ref<PriorityFilter>('all')

const searchTerm = ref('')
const isFiltersSheetOpen = ref(false)
const hasActiveFilters = computed(() => activeFilter.value !== 'All' || activePriority.value !== 'all')
let searchDebounceHandle: ReturnType<typeof setTimeout> | undefined

const PER_PAGE = 15

const tasks = ref<Task[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const isSortingMode = ref(false)
const isSavingOrder = ref(false)
const isLoadingMore = ref(false)

// Working copy used while in sorting mode so we don't affect the filtered view
const sortableTasks = ref<Task[]>([])

const counts = ref<TaskCounts>({ all: 0, 0: 0, 1: 0, 2: 0, 3: 0 })

const filterCounts = computed(() => {
  return {
    'All': counts.value.all ?? 0,
    'Pending': counts.value[TaskStatus.PENDING] ?? 0,
    'In Progress': counts.value[TaskStatus.IN_PROGRESS] ?? 0,
    'Completed': counts.value[TaskStatus.COMPLETED] ?? 0,
    'Cancelled': counts.value[TaskStatus.CANCELLED] ?? 0
  }
})

const hasMore = computed(() => currentPage.value < lastPage.value)

const loading = ref(true)
const error = ref<string | null>(null)
const selectedTaskId = ref<string>('')
const isEditDialogOpen = ref(false)

const fetchTasks = async (page = 1, append = false) => {
  try {
    append ? (isLoadingMore.value = true) : (loading.value = true)
    const result = await TaskService.getAll(apiFilterMap[activeFilter.value], page, PER_PAGE, {
      priority: activePriority.value,
      search: searchTerm.value
    })
    tasks.value = append ? [...tasks.value, ...result.data] : result.data
    currentPage.value = result.meta.current_page
    lastPage.value = result.meta.last_page
    total.value = result.meta.total
    counts.value = result.meta.counts
    error.value = null
  } catch (err) {
    error.value = 'Failed to load tasks'
    if (!append) tasks.value = []
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => fetchTasks(currentPage.value + 1, true)

watch([activeFilter, activePriority], () => fetchTasks(1))

watch(searchTerm, () => {
  clearTimeout(searchDebounceHandle)
  searchDebounceHandle = setTimeout(() => fetchTasks(1), 350)
})

const clearFilters = () => {
  activeFilter.value = 'All'
  activePriority.value = 'all'
}

onMounted(() => fetchTasks(1))

const remainingTasks = computed(() => total.value - (counts.value[TaskStatus.COMPLETED] ?? 0))

const completedCount = computed(() => counts.value[TaskStatus.COMPLETED] ?? 0)

const handleTaskCreated = async () => {
  await fetchTasks(1)
}

const handleToggleTask = async (taskId: string, newStatus: TaskStatus) => {
  try {
    await TaskService.updateStatus(taskId, newStatus)
    await fetchTasks(1)
  } catch (err) {
    error.value = 'Failed to update task status'
  }
}

const handleUpdatePriority = async (taskId: string, newPriority: TaskPriority) => {
  try {
    await TaskService.updatePriority(taskId, newPriority)
    await fetchTasks(1)
  } catch (err) {
    error.value = 'Failed to update task priority'
  }
}

const handleDeleteTask = async (taskId: string) => {
  try {
    await TaskService.delete(taskId)
    await fetchTasks(1)
  } catch (err) {
    error.value = 'Failed to delete task'
  }
}

const clearCompleted = async () => {
  try {
    await TaskService.getAll(TaskStatus.COMPLETED, 1, 1000).then(result =>
      Promise.all(result.data.map((t: any) => TaskService.delete(t.id)))
    )
    await fetchTasks(1)
  } catch (err) {
    error.value = 'Failed to clear completed tasks'
  }
}

const handleEditTask = (task: Task) => {
  selectedTaskId.value = task.id
  isEditDialogOpen.value = true
}

const handleTaskUpdated = (updatedTask: Task) => {
  tasks.value = tasks.value.map((t: any) =>
    t.id === updatedTask.id ? updatedTask : t
  )
}

// ── Sorting / DnD ──────────────────────────────────────────────────────────
function enableSorting() {
  // Snapshot the current visible list as the draggable working copy
  sortableTasks.value = [...tasks.value]
  isSortingMode.value = true
}

async function saveOrder() {
  isSavingOrder.value = true
  try {
    const payload = sortableTasks.value.map((task, index) => ({
      id: task.id,
      position: index
    }))
    await TaskService.reorderTasks(payload)
    await fetchTasks()
    isSortingMode.value = false
  } catch (err) {
    error.value = 'Failed to save task order'
  } finally {
    isSavingOrder.value = false
  }
}

function cancelSorting() {
  isSortingMode.value = false
  sortableTasks.value = []
}
</script>

<template>
  <div class="max-w-3xl p-2 sm:p-6 mx-auto">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
      <h1 class="text-2xl font-bold sm:text-3xl">Todo App</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Sorting toggle -->
        <template v-if="!isSortingMode">
          <Button
            variant="outline"
            size="sm"
            class="gap-2 cursor-pointer"
            :disabled="tasks.length < 2"
            @click="enableSorting"
          >
            <ArrowUpDownIcon class="w-4 h-4" />
            Sort
          </Button>
        </template>
        <template v-else>
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer"
            @click="cancelSorting"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            class="gap-2 cursor-pointer"
            :disabled="isSavingOrder"
            @click="saveOrder"
          >
            <Spinner v-if="isSavingOrder" class="w-4 h-4" />
            <CheckIcon v-else class="w-4 h-4" />
            {{ isSavingOrder ? 'Saving...' : 'Save Order' }}
          </Button>
        </template>
        <TaskAddForm @task-created="handleTaskCreated" />
      </div>
    </div>

    <!-- Search + filters — hidden while sorting to avoid confusion -->
    <div v-if="!isSortingMode" class="flex items-center gap-2 mb-4">
      <div class="relative flex-1">
        <SearchIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchTerm"
          placeholder="Search tasks..."
          class="pl-8 pr-8"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
          @click="searchTerm = ''"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Mobile: filter icon opens sheet -->
      <Sheet v-model:open="isFiltersSheetOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="relative shrink-0 cursor-pointer sm:hidden">
            <SlidersHorizontalIcon class="w-4 h-4" />
            <span v-if="hasActiveFilters" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div class="flex flex-col gap-4 mt-2 overflow-y-auto">
            <div>
              <p class="text-sm font-medium mb-2">Status</p>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="filter in filters"
                  :key="filter"
                  :variant="activeFilter === filter ? 'default' : 'outline'"
                  class="text-xs justify-start cursor-pointer"
                  @click="activeFilter = filter"
                >
                  {{ filter }} ({{ filterCounts[filter] }})
                </Button>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium mb-2">Priority</p>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="p in priorityFilters"
                  :key="p.value"
                  :variant="activePriority === p.value ? 'default' : 'outline'"
                  class="text-xs justify-start cursor-pointer"
                  @click="activePriority = p.value"
                >
                  {{ p.label }}
                </Button>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="ghost" class="cursor-pointer" @click="clearFilters">
              Clear filters
            </Button>
            <SheetClose as-child>
              <Button class="cursor-pointer">Apply</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Desktop: inline filter tabs + priority -->
    <div v-if="!isSortingMode" class="hidden sm:flex sm:flex-row flex-wrap gap-2 mb-6">
      <Button
        v-for="filter in filters"
        :key="filter"
        :variant="activeFilter === filter ? 'default' : 'outline'"
        @click="activeFilter = filter"
        class="text-xs cursor-pointer sm:text-sm whitespace-nowrap"
      >
        {{ filter }} ({{ filterCounts[filter] }})
      </Button>
      <span class="w-px bg-border mx-1" />
      <Button
        v-for="p in priorityFilters"
        :key="p.value"
        :variant="activePriority === p.value ? 'default' : 'outline'"
        @click="activePriority = p.value"
        class="text-xs cursor-pointer sm:text-sm whitespace-nowrap"
      >
        {{ p.label }}
      </Button>
    </div>

    <!-- Sorting mode banner -->
    <div
      v-if="isSortingMode"
      class="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
    >
      <GripVerticalIcon class="w-4 h-4" />
      Drag tasks to reorder, then click <strong class="mx-1">Save Order</strong> to persist.
    </div>

    <div v-if="loading" class="py-8 text-center">
      <Spinner class="w-8 h-8 mx-auto" />
    </div>

    <div v-else-if="error" class="p-4 mb-6 text-red-700 bg-red-100 rounded">
      {{ error }}
    </div>

    <template v-else>
      <div class="mb-6 space-y-2">

        <!-- DnD list (sorting mode) -->
        <draggable
          v-if="isSortingMode"
          v-model="sortableTasks"
          item-key="id"
          handle=".drag-handle"
          animation="200"
          ghost-class="opacity-40"
          chosen-class="shadow-lg"
        >
          <template #item="{ element }">
            <div class="mb-2">
              <TaskItem
                :task="element"
                :is-sorting="true"
                @toggle="handleToggleTask"
                @updatePriority="handleUpdatePriority"
                @delete="handleDeleteTask"
                @edit="handleEditTask"
              />
            </div>
          </template>
        </draggable>

        <!-- Normal list -->
        <TransitionGroup v-else name="list">
          <TaskItem
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :is-sorting="false"
            @toggle="handleToggleTask"
            @updatePriority="handleUpdatePriority"
            @delete="handleDeleteTask"
            @edit="handleEditTask"
          />
        </TransitionGroup>

        <div v-if="!isSortingMode && hasMore" class="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            <Spinner v-if="isLoadingMore" class="w-4 h-4" />
            {{ isLoadingMore ? 'Loading...' : 'Load more' }}
          </Button>
        </div>

      </div>

      <div
        v-if="!isSortingMode"
        class="flex items-center justify-between text-sm text-muted-foreground"
      >
        <span>{{ remainingTasks }} items left</span>
        <Button
          variant="ghost"
          @click="clearCompleted"
          :disabled="completedCount === 0"
        >
          Clear completed ({{ completedCount }})
        </Button>
      </div>

      <TaskEditForm
        :task-id="selectedTaskId"
        :open="isEditDialogOpen"
        @update:open="isEditDialogOpen = $event"
        @task-updated="handleTaskUpdated"
      />
    </template>
  </div>
</template>

<style>
	.list-enter-active,
	.list-leave-active {
		transition: all 0.3s ease;
	}
	.list-enter-from,
	.list-leave-to {
		opacity: 0;
		transform: translateX(30px);
	}
</style>
