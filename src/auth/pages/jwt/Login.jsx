import { useState } from 'react'
import { comCliente } from '@/utils/customerHost'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useAuthContext } from '@/auth'
import { Alert } from '@/components'
import { lerVoltaAposLogin, limparVoltaAposLogin } from '@/auth/voltaAposLogin'
import { LogoDoAcesso, CampoDoAcesso, CampoSenhaDoAcesso, BotaoDoAcesso } from './CamposDoAcesso'
import { useSessaoNoLogin, useCadastroLiberado } from './useSessaoNoLogin'

const loginSchema = Yup.object().shape({
    email: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    password: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
})

const initialValues = {
    email: '',
    password: '',
}

//VOLTA PARA A TELA QUE PEDIU O LOGIN COM A QUERY (?pag=...&acao=...). ANTES SÓ O pathname: NESTE PAINEL ELE É SEMPRE "/",
//ENTÃO A SESSÃO EXPIRADA SEMPRE CAÍA NA TELA INICIAL
const telaDeOrigem = (destino, origem) =>
    destino || (origem ? `${origem.pathname || '/'}${origem.search || ''}${origem.hash || ''}` : '') || lerVoltaAposLogin() || '/'

//USUÁRIO QUE EXISTE EM MAIS DE UM PAINEL (409 DO /auth/master): ESCOLHE QUAL ACESSAR
const EscolhaDePainel = ({ paineis, desabilitado, onEscolher }) => (
    <div className="flex flex-col gap-2">
        {paineis.map((painel) => (
            <button
                key={painel.id_painel_cliente}
                type="button"
                className="btn btn-light justify-start"
                disabled={desabilitado}
                onClick={() => onEscolher(painel.id_painel_cliente)}
            >
                <span className="flex flex-col items-start">
                    <span className="font-medium">{painel.cliente}</span>
                    <span className="text-2sm text-gray-600">{painel.dominio}</span>
                </span>
            </button>
        ))}
    </div>
)

// destino: PARA ONDE IR DEPOIS DO LOGIN QUANDO A TELA NÃO VEM DO REDIRECT PARA /auth/login (VER RequireAuth)
const Login = ({ destino }) => {

    const [loading, setLoading] = useState(false)
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const from = telaDeOrigem(destino, location.state?.from)
    // Painéis retornados pela API quando o usuário existe em mais de um (409)
    const [paineis, setPaineis] = useState(null)

    useSessaoNoLogin(destino, from)
    const cadastroLiberado = useCadastroLiberado()

    const handleLogin = async (values, setStatus, idPainelCliente = null) => {

        setLoading(true)
        setStatus()

        try {

            await login(values.email, values.password, idPainelCliente)

            limparVoltaAposLogin()
            navigate(from, { replace: true })

        } catch (error) {

            const variosPaineis = error?.code === 'MULTIPLE_PANELS'
            setPaineis(variosPaineis ? error.paineis : null)
            setStatus(variosPaineis
                ? 'Seu usuário existe em mais de um painel. Escolha abaixo qual deseja acessar.'
                : error?.message || 'E-mail ou senha incorretos.')

        } finally {
            setLoading(false)
        }

    }

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: (values, { setStatus }) => handleLogin(values, setStatus),
    })

    return (
        <div className="card max-w-[390px] w-full">
            <form
                className="card-body flex flex-col gap-5 p-10"
                onSubmit={formik.handleSubmit}
                noValidate
            >
                <LogoDoAcesso />

                <h3 className="text-left font-semibold">Acesse seu sistema</h3>

                {formik.status && (
                    <Alert variant={paineis ? 'warning' : 'danger'}>
                        {formik.status}
                    </Alert>
                )}

                {paineis && (
                    <EscolhaDePainel
                        paineis={paineis}
                        desabilitado={loading}
                        onEscolher={(idPainel) => handleLogin(formik.values, formik.setStatus, idPainel)}
                    />
                )}

                <CampoDoAcesso
                    formik={formik}
                    name="email"
                    id="login-email"
                    label="E-mail ou login"
                    placeholder="Digite seu e-mail ou login"
                />

                {/* "Esqueceu sua senha?" NÃO EXISTE: O PAINEL NÃO TEM RECUPERAÇÃO DE SENHA */}
                <CampoSenhaDoAcesso
                    formik={formik}
                    name="password"
                    id="login-senha"
                    label="Senha"
                    placeholder="Digite sua senha"
                />

                <BotaoDoAcesso carregando={loading || formik.isSubmitting}>Entrar</BotaoDoAcesso>

                {/* O ?a= VAI JUNTO NO LINK: SEM ELE A VOLTA PARA O LOGIN ESQUECERIA O CLIENTE */}
                {cadastroLiberado && (
                    <div className="flex items-center justify-start font-medium">
                        <span className="text-2sm text-gray-600 me-1.5">
                            Não tem uma conta?
                        </span>
                        <Link to={comCliente('/auth/signup')} className="text-2sm link">
                            Cadastre-se!
                        </Link>
                    </div>
                )}
            </form>
        </div>
    )
}

export { Login }
