<script setup lang="ts">
import { PencilIcon, TrashIcon, GripVerticalIcon } from 'lucide-vue-next'
import type { Task } from '@/services/taskService'
import { TaskStatus, TaskPriority } from "@/services/taskService"
import Button from '@/components/ui/button/Button.vue'
import TaskBadgeSelect from '@/components/task/TaskBadgeSelect.vue'

const props = defineProps<{
	task: Task
  isSorting?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', taskId: string, newStatus: TaskStatus): void
  (e: 'updatePriority', taskId: string, newPriority: TaskPriority): void
	(e: 'delete', taskId: string): void
	(e: 'edit', task: Task): void
}>()

const statusOptions = [
  { value: TaskStatus.PENDING, label: 'Pending', colorClass: 'bg-amber-100 text-amber-800' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress', colorClass: 'bg-blue-100 text-blue-800' },
  { value: TaskStatus.COMPLETED, label: 'Completed', colorClass: 'bg-green-100 text-green-800' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled', colorClass: 'bg-gray-100 text-gray-800' }
]

const priorityOptions = [
  { value: TaskPriority.LOW, label: 'Low', colorClass: 'bg-slate-100 text-slate-800 border border-slate-200' },
  { value: TaskPriority.MEDIUM, label: 'Medium', colorClass: 'bg-amber-100 text-amber-800 border border-amber-200' },
  { value: TaskPriority.HIGH, label: 'High', colorClass: 'bg-red-100 text-red-800 border border-red-200' }
]

function handleStatusChangeValue(newStatus: number) {
  emit('toggle', props.task.id, newStatus as TaskStatus)
}

function handlePriorityChangeValue(newPriority: number) {
  emit('updatePriority', props.task.id, newPriority as TaskPriority)
}

const handleDelete = () => {
	emit('delete', props.task.id)
}

</script>

<template>
	<div
    class="flex items-start gap-2 p-4 transition-colors border rounded-lg group hover:bg-accent/50"
    :class="{ 'cursor-grab active:cursor-grabbing ring-2 ring-primary/20': isSorting }"
  >
    <!-- Drag Handle -->
    <div
      v-if="isSorting"
      class="drag-handle flex items-center self-center px-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-grab shrink-0"
    >
      <GripVerticalIcon class="w-5 h-5" />
    </div>

		<div class="flex-1 min-w-0 overflow-hidden">
			<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
				<span 
					:title="task.name"
					class="font-medium line-clamp-2 min-h-[40px] w-full max-w-full truncate text-ellipsis
						xs:max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
					:class="{
					'line-through text-muted-foreground': task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED
					}"
				>
					{{ task.name }}
				</span>
				
				<div class="flex flex-wrap items-center gap-2 ml-auto shrink-0">
					<TaskBadgeSelect
						:model-value="task.priority ?? TaskPriority.LOW"
						:options="priorityOptions"
						@update:model-value="handlePriorityChangeValue"
					/>
					
					<TaskBadgeSelect
						:model-value="task.status"
						:options="statusOptions"
						@update:model-value="handleStatusChangeValue"
					/>
					
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							class="transition-opacity opacity-100 md:opacity-0 cursor-pointer md:group-hover:opacity-100"
							@click="emit('edit', task)"
						>
							<PencilIcon class="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="transition-opacity opacity-100 md:opacity-0 cursor-pointer md:group-hover:opacity-100"
							@click="handleDelete"
						>
							<TrashIcon class="w-4 h-4 text-destructive" />
						</Button>
					</div>
				</div>
			</div>
		
			<div
				v-if="task.description"
				class="mt-2 prose-sm prose text-muted-foreground"
				:class="{
					'line-through text-muted-foreground': task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED
				}"
				v-html="task.description"
			>
			</div>
		</div>
	</div>
</template>
