
    import { Navigate, Route, Routes } from 'react-router'
    import { Login, Signup, Terms } from './pages/jwt'
    import { AuthLayout } from '@/layouts/auth'

    const AuthPage = () => (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route index element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* SEM /reset-password: O PAINEL NÃO TEM RECUPERAÇÃO NEM TROCA DE SENHA. A ROTA CAI NO 404 ABAIXO */}
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<Navigate to="/error/404" />} />
            </Route>
        </Routes>
    )

    export { AuthPage }
