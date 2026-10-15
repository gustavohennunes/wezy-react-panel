import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ScreenLoader } from '@/components/loaders'
import { AuthLayout } from '@/layouts/auth'
import { Login } from './pages/jwt'
import { useAuthContext } from './useAuthContext'
const RequireAuth = () => {
    const { auth, loading } = useAuthContext()
    const location = useLocation()
    if (loading) {
        return <ScreenLoader />
    }
    if (auth) {
        return <Outlet />
    }
    // /?a=dominio SEM LOGIN: A TELA DE LOGIN APARECE NA PRÓPRIA URL, COMO NO PAINEL LEGADO (SEM IR PARA /auth/login).
    // DEPOIS DO LOGIN FICA NA MESMA URL — O auth MUDA E ESTE COMPONENTE PASSA A MOSTRAR A PÁGINA
    if (new URLSearchParams(location.search).get('a')) {
        return (
            <AuthLayout>
                <Login destino={location.pathname + location.search} />
            </AuthLayout>
        )
    }
    return (
        <Navigate
            to="/auth/login"
            state={{
                from: location,
            }}
            replace
        />
    )
}
export { RequireAuth }
