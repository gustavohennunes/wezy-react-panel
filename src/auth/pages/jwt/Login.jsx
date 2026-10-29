import { useState } from 'react'
import { comCliente } from '@/utils/customerHost'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useAuthContext } from '@/auth'
import { Alert, KeenIcon } from '@/components'
import { lerVoltaAposLogin, limparVoltaAposLogin } from '@/auth/voltaAposLogin'
import { LogoDoAcesso, CampoDoAcesso, CampoSenhaDoAcesso, BotaoDoAcesso } from './CamposDoAcesso'
import { useSessaoNoLogin, useCadastroLiberado } from './useSessaoNoLogin'

const senhaSchema = Yup.string()
    .min(3, 'Digite pelo menos 3 caracteres')
    .max(50, 'Digite no máximo 50 caracteres')
    .required('Campo obrigatório')

//SÓ E-MAIL, NO LOGIN CENTRAL (/auth/master) E NO DIRETO NO PAINEL DE UM CLIENTE (?a=, panel/login)
const loginSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Digite um e-mail válido')
        .max(255, 'Digite no máximo 255 caracteres')
        .required('Campo obrigatório'),
    password: senhaSchema,
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
    <div className="flex flex-col gap-2.5">
        {paineis.map((painel) => (
            <button
                key={`${painel.host || ''}-${painel.id_painel_cliente}`}
                type="button"
                className="group flex items-center gap-3 w-full rounded-lg border border-gray-300 bg-light px-3.5 py-3 text-start transition-colors hover:border-primary hover:bg-primary-light focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-60"
                disabled={desabilitado}
                onClick={() => onEscolher(painel)}
            >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-inverse">
                    <KeenIcon icon="abstract-26" className="text-lg" />
                </span>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-gray-900">{painel.cliente}</span>
                    <span className="truncate text-2sm text-gray-600">{painel.dominio}</span>
                </span>
                <KeenIcon icon="right" className="shrink-0 text-sm text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
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

    //ENTER COM E-MAIL/SENHA PREENCHIDOS PELO NAVEGADOR: O CHROME SÓ REPASSA O AUTOPREENCHIMENTO AO REACT DEPOIS DE UM CLIQUE
    //NA PÁGINA, ENTÃO NO ENTER O FORMIK AINDA ESTAVA VAZIO E O LOGIN NÃO SAÍA (COM O CLIQUE NO BOTÃO FUNCIONAVA). AQUI OS
    //VALORES VÊM DOS PRÓPRIOS CAMPOS ANTES DE ENVIAR
    const enviar = async (event) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)
        await formik.setValues({
            email: String(dados.get('email') ?? formik.values.email),
            password: String(dados.get('password') ?? formik.values.password),
        }, false)
        formik.submitForm()
    }

    return (
        <div className="card max-w-[390px] w-full">
            <form
                className="card-body flex flex-col gap-5 p-10"
                onSubmit={enviar}
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
                        onEscolher={(painel) => handleLogin(formik.values, formik.setStatus, painel)}
                    />
                )}

                <CampoDoAcesso
                    formik={formik}
                    name="email"
                    id="login-email"
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    type="email"
                    autoComplete="email"
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
