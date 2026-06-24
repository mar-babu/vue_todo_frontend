<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import Button from '@/components/ui/button/Button.vue'
import Spinner from "@/components/ui/spinner/Spinner.vue"
import TaskAddForm from "@/components/task/TaskAddForm.vue"
import TaskItem from "@/components/task/TaskItem.vue"
import TaskEditForm from "@/components/task/TaskEditForm.vue"
import { TaskService } from "@/services/taskService"
import { TaskStatus, TaskPriority } from "@/services/taskService"
import type { Task } from "@/services/taskService"

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

const allTasks = ref<Task[]>([]);

const tasks = computed(() => {
  if (activeFilter.value === 'All') return allTasks.value;
  return allTasks.value.filter(t => t.status === apiFilterMap[activeFilter.value]);
});

const filterCounts = computed(() => {
  return {
    'All': allTasks.value.length,
    'Pending': allTasks.value.filter(t => t.status === TaskStatus.PENDING).length,
    'In Progress': allTasks.value.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    'Completed': allTasks.value.filter(t => t.status === TaskStatus.COMPLETED).length,
    'Cancelled': allTasks.value.filter(t => t.status === TaskStatus.CANCELLED).length
  }
});

const loading = ref(true);
const error = ref<string | null>(null);
const selectedTaskId = ref<string>('')
const isEditDialogOpen = ref(false)

const fetchTasks = async () => {
  try {
    loading.value = true
    allTasks.value = await TaskService.getAll('all')
    error.value = null
  } catch (err) {
    error.value = 'Failed to load tasks'
    allTasks.value = []
  } finally {
    loading.value = false
  }
}

// initial fetch
onMounted(fetchTasks)

const remainingTasks = computed(() => 
  allTasks.value.filter((t: any) => t.status !== TaskStatus.COMPLETED).length
)

const completedCount = computed(() =>
  allTasks.value.filter((t: any) => t.status === TaskStatus.COMPLETED).length
)

const handleTaskCreated = async () => {
  await fetchTasks()
}

const handleToggleTask = async (taskId: string, newStatus: TaskStatus) => {
  try {
    await TaskService.updateStatus(taskId, newStatus)
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to update task status'
  }
}

const handleUpdatePriority = async (taskId: string, newPriority: TaskPriority) => {
  try {
    await TaskService.updatePriority(taskId, newPriority)
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to update task priority'
  }
}

const handleDeleteTask = async (taskId: string) => {
  try {
    await TaskService.delete(taskId)
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to delete task'
  }
}

const clearCompleted = async () => {
  try {
    const completedTasks = allTasks.value.filter((t: any) => t.status === TaskStatus.COMPLETED)
    await Promise.all(completedTasks.map((t: any) => TaskService.delete(t.id)))
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to clear completed tasks'
  }
}

const handleEditTask = (task: Task) => {
  selectedTaskId.value = task.id
  isEditDialogOpen.value = true
}

const handleTaskUpdated = (updatedTask: Task) => {
  allTasks.value = allTasks.value.map((t: any) => 
    t.id === updatedTask.id ? updatedTask : t
  )
}
</script>

<template>
  <div class="max-w-3xl p-2 sm:p-6 mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Todo App</h1>
      <TaskAddForm @task-created="handleTaskCreated" />
    </div>

    <div class="grid grid-cols-3 gap-2 mb-6 sm:flex sm:flex-row flex-wrap">
      <Button
        v-for="filter in filters"
        :key="filter"
        :variant="activeFilter === filter ? 'default' : 'outline'"
        @click="activeFilter = filter"
        class="text-xs cursor-pointer sm:text-sm whitespace-nowrap"
      >
        {{ filter }} ({{ filterCounts[filter] }})
      </Button>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <Spinner class="w-8 h-8 mx-auto" />
    </div>

    <div v-else-if="error" class="p-4 mb-6 text-red-700 bg-red-100 rounded">
      {{ error }}
    </div>

    <template v-else>
      <div class="mb-6 space-y-4">
        <TransitionGroup name="list">
          <TaskItem
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            @toggle="handleToggleTask"
            @updatePriority="handleUpdatePriority"
            @delete="handleDeleteTask"
            @edit="handleEditTask"
          />
        </TransitionGroup>
      </div>

      <div
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
