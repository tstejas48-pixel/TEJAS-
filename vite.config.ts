import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        login: resolve(process.cwd(), 'login.html'),
        register: resolve(process.cwd(), 'register.html'),
        profile: resolve(process.cwd(), 'profile.html'),
        appointments: resolve(process.cwd(), 'appointments.html'),
        booking: resolve(process.cwd(), 'booking.html'),
      },
    },
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})