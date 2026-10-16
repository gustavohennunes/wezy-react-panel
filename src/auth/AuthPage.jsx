
    import { Navigate, Route, Routes } from 'react-router'
    import { Login, Signup, Terms } from './pages/jwt'
    import { AuthBrandedLayout } from '@/layouts/auth-branded'
    import { AuthLayout } from '@/layouts/auth'
    import { CheckEmail } from '@/auth/pages/jwt'

    const AuthPage = () => (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route index element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* /reset-password DESLIGADO: A API AINDA NÃO TEM panel/forgot-password NEM A TROCA DE SENHA. A ROTA CAI NO 404
                    ABAIXO; AS TELAS FICAM EM pages/jwt/reset-password PARA QUANDO O FLUXO FOR FEITO */}
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<Navigate to="/error/404" />} />
            </Route>
        </Routes>
    )

    export { AuthPage }
