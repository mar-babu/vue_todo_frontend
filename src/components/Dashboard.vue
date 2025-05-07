<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import axios from 'axios';
import TaskView from './task/TaskView.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter()

async function handleLogout() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    )

    toast.success(response.data.message)

    localStorage.removeItem('auth_token')
    router.push('/login')

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message)
    } else {
      toast.error('An unexpected error occurred')
    }
  }
}
</script>

<template>
  <div class="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          <div class="grid grid-cols-3">
            <p>Welcome to your dashboard!</p>
            <div></div>
            <div>
              <Button
                @click="handleLogout"
                variant="destructive"
                class="float-right h-8 cursor-pointer w-18"
              >
                Logout
              </Button>
            </div>

          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <p>You're successfully logged in!</p>
        </div>
        <div>
          <TaskView />
        </div>
      </CardContent>
    </Card>
  </div>
</template>