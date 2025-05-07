<script setup lang="ts">
import { PencilIcon, TrashIcon } from 'lucide-vue-next'
import type { Task } from '@/services/taskService'
import { TaskStatus } from "@/services/taskService"
import { getStatusLabel } from '@/lib/utils';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'

const props = defineProps<{
	task: Task
}>()

const emit = defineEmits<{
  (e: 'toggle', taskId: string, newStatus: TaskStatus): void
	(e: 'delete', taskId: string): void
	(e: 'edit', task: Task): void
}>()


function handleToggle(value: any) {
  // multi-select checkbox with boolean value
  if (Array.isArray(value)) {
    const isChecked = value.includes(props.task.id)
    const newStatus = isChecked ? TaskStatus.COMPLETED : TaskStatus.PENDING
    emit('toggle', props.task.id, newStatus)
  } else {
    // single checkbox with boolean value
    const newStatus = value ? TaskStatus.COMPLETED : TaskStatus.PENDING
    emit('toggle', props.task.id, newStatus)
  }
}


const handleDelete = () => {
	emit('delete', props.task.id)
}

</script>

<template>
	<div class="flex items-start gap-4 p-4 transition-colors border rounded-lg group hover:bg-accent/50">
		<Checkbox
			:id="`task-${task.id}`"
			:model-value="task.status === TaskStatus.COMPLETED"
			@update:modelValue="handleToggle"
			class="mt-1"
		/>
		
		<div class="flex-1">
			<div class="flex items-center justify-between gap-2">
				<span class="font-medium"
					:class="{
							'line-through text-muted-foreground': task.status === TaskStatus.COMPLETED
					}"
				>
					{{ task.name }}
				</span>
				<span class="text-sm text-muted-foreground">
					{{ getStatusLabel(task.status) }}
				</span>
				
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						class="transition-opacity opacity-0 group-hover:opacity-100"
						@click="emit('edit', task)"
					>
						<PencilIcon class="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="transition-opacity opacity-0 group-hover:opacity-100"
						@click="handleDelete"
					>
						<TrashIcon class="w-4 h-4 text-destructive" />
					</Button>
				</div>

			</div>
		
			<div
				v-if="task.description"
				class="mt-2 prose-sm prose text-muted-foreground"
				v-html="task.description"
			>
			</div>
		</div>
	</div>
</template>
