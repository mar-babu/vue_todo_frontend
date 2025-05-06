<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from "vue";
import axios, { type AxiosError } from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const form = ref<FormData>({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const router = useRouter();

interface ApiError {
  status: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

interface ApiSuccess {
  status: boolean;
  message: string;
  token: string;
}

const errors = ref<Record<string, string[]>>({});

async function handleSubmit() {
  isLoading.value = true;
  errors.value = {};

  try {
    const response = await api.post<ApiSuccess>("/auth/register", form.value);

    localStorage.setItem("auth_token", response.data.token);

    toast.success(response.data.message);

    router.push("/login");
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    console.log(axiosError, "axiosError");
    console.log(axiosError.response, "axiosError.response");
    if (axiosError.response?.status === 422) {
      errors.value = axiosError.response.data.errors || {};
      const errorMessage = axiosError.response?.data?.message;
      toast.error(errorMessage);
    } else {
      const errorMessage =
        axiosError.response?.data?.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="items-center justify-center py-[8%]">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Create an account </CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <!-- name field -->
            <div class="grid gap-2">
              <Label for="name">Full Name</Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="John Doe"
                required
                :class="{ 'border-destructive': errors.name }"
              />
              <p v-if="errors.name" class="text-sm text-destructive">
                {{ errors.name[0] }}
              </p>
            </div>

            <!-- email field -->
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="m@example.com"
                required
                :class="{ 'border-destructive': errors.email }"
              />
              <p v-if="errors.email" class="text-sm text-destructive">
                {{ errors.email[0] }}
              </p>
            </div>

            <!-- password field -->
            <div class="grid gap-2">
              <Label for="password">Password (min 8 characters)</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :class="{ 'border-destructive': errors.password }"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" class="h-4 w-4" />
                  <EyeOffIcon v-if="!showPassword" class="h-4 w-4" />
                  <span class="sr-only">Toggle password visibility</span>
                </Button>
              </div>
              <p v-if="errors.password" class="text-sm text-destructive">
                {{ errors.password[0] }}
              </p>
            </div>

            <!-- confirm password field -->
            <div class="grid gap-2">
              <Label for="confirm-password">Confirm Password</Label>
              <div class="relative">
                <Input
                  id="confirm-password"
                  v-model="form.password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  :class="{ 'border-destructive': errors.password_confirmation }"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeIcon v-if="showConfirmPassword" class="h-4 w-4" />
                  <EyeOffIcon v-else class="h-4 w-4" />
                  <span class="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>

            <!-- submit button -->
            <Button type="submit" class="w-full" :disabled="isLoading">
              <template v-if="isLoading">
                <svg
                  class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                Creating account...
              </template>
              <template v-else> Sign Up </template>
            </Button>
          </div>
        </form>

        <div class="mt-4 text-center text-sm">
          Already have an account?
          <RouterLink to="/login" class="underline"> Sign in </RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>

</template>
