<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'
import {
  CheckboxIndicator,
  CheckboxRoot,
  useForwardPropsEmits
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

function handleChange(value: any) {
  emits('update:modelValue', value)
}
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="cn(
      'h-4 w-4 shrink-0 rounded border border-neutral-300 dark:border-neutral-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class
    )"
    @checked-change="handleChange"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <slot>
        <Check class="w-3.5 h-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
