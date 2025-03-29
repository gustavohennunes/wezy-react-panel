
    import { Navigate, Route, Routes } from 'react-router'
    import { Login, ResetPassword, ResetPasswordChange, ResetPasswordChanged, ResetPasswordCheckEmail, ResetPasswordEnterEmail, Signup, TwoFactorAuth, Terms } from './pages/jwt'
    import { AuthBrandedLayout } from '@/layouts/auth-branded'
    import { AuthLayout } from '@/layouts/auth'
    import { CheckEmail } from '@/auth/pages/jwt'

    const AuthPage = () => (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route index element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<Navigate to="/error/404" />} />
            </Route>
        </Routes>
    )

    export { AuthPage }
