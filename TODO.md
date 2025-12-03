# TODO: Modificar URLs para usar VITE_API_BASE

- [ ] src/pages/VerifyEmailPage.jsx: Reemplazar "http://localhost:8080/api/users/verify-email" y "http://localhost:8080/api/users/resend-code" con import.meta.env.VITE_API_BASE
- [ ] src/pages/ResetPasswordPage.jsx: Reemplazar "http://localhost:8080/api/users/reset-password" con import.meta.env.VITE_API_BASE
- [ ] src/pages/RecoverPasswordPage.jsx: Reemplazar "http://localhost:8080/api/users/recover-password" con import.meta.env.VITE_API_BASE
- [ ] src/api/auth.js: Remover definición local de API_BASE y usar directamente import.meta.env.VITE_API_BASE
- [ ] src/api/websocket.js: Cambiar VITE_API_URL a VITE_API_BASE
