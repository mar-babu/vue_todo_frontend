<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

const form = ref({
  email: "",
  password: "",
});

const isLoading = ref(false);
const errors = ref<Record<string, string[]>>({});

async function handleLogin() {
  isLoading.value = true;
  errors.value = {};

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, form.value);

    localStorage.setItem("auth_token", response.data.token);

    toast.success(response.data.message);

    router.push("/dashboard");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors || {};
        toast.error(error.response.data.message);
      } else if (error.response.status === 401) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <Card class="max-w-sm mx-auto">
    <CardHeader>
      <CardTitle>Login to your account</CardTitle>
      <CardDescription>
        Enter your email below to login to your account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleLogin">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="text"
              placeholder="m@example.com"
              required
              :class="{ 'border-destructive': errors.email }"
            />
            <p v-if="errors.email" class="text-sm text-destructive">
              {{ errors.email[0] }}
            </p>
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a
                href="#"
                class="inline-block ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              required
              :class="{ 'border-destructive': errors.password }"
            />
            <p v-if="errors.password" class="text-sm text-destructive">
              {{ errors.password[0] }}
            </p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            <template v-if="isLoading">
              <svg
                class="w-4 h-4 mr-3 -ml-1 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging In...
            </template>
            <span v-else>Login</span>
          </Button>
          <Button variant="outline" class="w-full"> Login with Google </Button>
        </div>
        <div class="mt-4 text-sm text-center">
          Don't have an account?
          <RouterLink to="/signup" class="underline"> Sign up </RouterLink>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts">
  export default {
    name: "LoginForm",
  };
</script>
