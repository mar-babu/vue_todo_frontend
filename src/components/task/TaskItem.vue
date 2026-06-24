<script setup lang="ts">
import { PencilIcon, TrashIcon } from 'lucide-vue-next'
import type { Task } from '@/services/taskService'
import { TaskStatus } from "@/services/taskService"
import { getStatusLabel } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue'

const props = defineProps<{
	task: Task
}>()

const emit = defineEmits<{
  (e: 'toggle', taskId: string, newStatus: TaskStatus): void
	(e: 'delete', taskId: string): void
	(e: 'edit', task: Task): void
}>()


function handleStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newStatus = Number(target.value) as TaskStatus
  emit('toggle', props.task.id, newStatus)
}

function getStatusColorClass(status: TaskStatus) {
  switch (status) {
    case TaskStatus.PENDING:
      return 'bg-amber-100 text-amber-800'
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800'
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800'
    case TaskStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const handleDelete = () => {
	emit('delete', props.task.id)
}

</script>

<template>
	<div class="flex items-start gap-4 p-4 transition-colors border rounded-lg group hover:bg-accent/50">
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
					<select 
						class="text-xs font-medium px-2 py-1 rounded-full cursor-pointer outline-none focus:ring-2 border-none"
						:class="getStatusColorClass(task.status)"
						:value="task.status"
						@change="handleStatusChange($event)"
					>
						<option :value="TaskStatus.PENDING" class="bg-amber-100 text-amber-800">Pending</option>
						<option :value="TaskStatus.IN_PROGRESS" class="bg-blue-100 text-blue-800">In Progress</option>
						<option :value="TaskStatus.COMPLETED" class="bg-green-100 text-green-800">Completed</option>
						<option :value="TaskStatus.CANCELLED" class="bg-gray-100 text-gray-800">Cancelled</option>
					</select>
					
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
