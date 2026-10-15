import { defineStore } from 'pinia'
import type { User, UserRole, LoginPayload, RegisterPayload, VerifyOtpPayload } from '~~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Demo user data for preview
  const demoUsers: Record<UserRole, User> = {
    customer: {
      id: 101,
      name: 'عبدالله محمد',
      email: 'customer@solarhub.energy',
      phone: '0501234567',
      role: 'customer',
      governorate: 'الرياض',
      isVerified: true,
      createdAt: '2025-01-01',
    },
    engineer: {
      id: 201,
      name: 'م. خالد الشهري',
      email: 'engineer@solarhub.energy',
      phone: '0559876543',
      role: 'engineer',
      governorate: 'جدة',
      isVerified: true,
      createdAt: '2025-01-01',
    },
    supplier: {
      id: 301,
      name: 'مؤسسة أفق الطاقة المتقدمة',
      companyName: 'مؤسسة أفق الطاقة المتقدمة للتجارة',
      email: 'supplier@solarhub.energy',
      phone: '0543210987',
      role: 'supplier',
      governorate: 'الدمام',
      isVerified: true,
      createdAt: '2025-01-01',
    },
  }

  // Restore session from localStorage on client
  function initAuth() {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('solarhub_token')
      const savedUser = localStorage.getItem('solarhub_user')
      if (savedToken && savedUser) {
        try {
          token.value = savedToken
          user.value = JSON.parse(savedUser)
        } catch {
          logout()
        }
      }
    }
  }

  // Login action
  async function login(payload: LoginPayload) {
    isLoading.value = true
    error.value = null
    try {
      // Simulate network request or call API
      await new Promise(resolve => setTimeout(resolve, 600))

      // Simulate check
      if (payload.login.includes('error') || payload.login === 'user.unknown@example.com') {
        throw new Error('البريد الإلكتروني المدخل غير مسجل لدينا في المنصة')
      }

      // Determine role from login if demo or default to customer
      let selectedRole: UserRole = 'customer'
      if (payload.login.includes('eng')) selectedRole = 'engineer'
      else if (payload.login.includes('sup') || payload.login.includes('store')) selectedRole = 'supplier'

      const loggedInUser: User = {
        ...demoUsers[selectedRole],
        email: payload.login.includes('@') ? payload.login : `${payload.login}@example.com`,
      }

      user.value = loggedInUser
      token.value = 'mock-jwt-token-' + Date.now()

      if (import.meta.client) {
        localStorage.setItem('solarhub_token', token.value)
        localStorage.setItem('solarhub_user', JSON.stringify(user.value))
      }

      return { success: true, user: user.value }
    } catch (err: any) {
      error.value = err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Register action
  async function register(payload: RegisterPayload) {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const newUser: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        governorate: payload.governorate,
        location: payload.location,
        companyName: payload.role === 'supplier' ? (payload as any).companyName : undefined,
        cvUrl: payload.role === 'engineer' ? 'mock-cv.pdf' : undefined,
        commercialRegisterUrl: payload.role === 'supplier' ? 'mock-cr.pdf' : undefined,
        isVerified: false,
        createdAt: new Date().toISOString(),
      }

      return { success: true, user: newUser }
    } catch (err: any) {
      error.value = err.message || 'حدث خطأ أثناء إنشاء الحساب'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Forgot password
  async function forgotPassword(loginInput: string) {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 700))

      if (loginInput.includes('unknown') || loginInput === 'user.unknown@example.com') {
        throw new Error('لم نتمكن من العثور على حساب مرتبط بهذا البريد أو رقم الجوال. يُرجى التحقق وإعادة المحاولة.')
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'لم نتمكن من العثور على حساب مرتبط بهذا البريد أو رقم الجوال'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Verify OTP
  async function verifyOtp(payload: VerifyOtpPayload) {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 600))

      if (payload.code.length !== 6) {
        throw new Error('رمز التحقق يجب أن يتكون من 6 أرقام')
      }

      if (payload.code === '000000') {
        throw new Error('رمز التحقق غير صحيح أو انتهت صلاحيته')
      }

      // Mark user as verified
      if (user.value) {
        user.value.isVerified = true
      } else {
        user.value = {
          ...demoUsers.customer,
          email: payload.email,
          isVerified: true,
        }
        token.value = 'mock-jwt-token-' + Date.now()
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'رمز التحقق غير صحيح'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  function logout() {
    user.value = null
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('solarhub_token')
      localStorage.removeItem('solarhub_user')
    }
    navigateTo('/auth/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    initAuth,
    login,
    register,
    forgotPassword,
    verifyOtp,
    logout,
  }
})
