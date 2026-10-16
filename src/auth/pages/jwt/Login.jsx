import { useEffect, useState } from 'react'
import axios from 'axios'
import { clearCustomerHostWithoutParam, comCliente, getCustomerHost, getFixedCustomerHost } from '@/utils/customerHost'
import { PANEL_LOGO } from '@/config/branding'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { KeenIcon } from '@/components'
import { toAbsoluteUrl } from '@/utils'
import { useAuthContext } from '@/auth'
import { useLayout } from '@/providers'
import { Alert } from '@/components'

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

// destino: PARA ONDE IR DEPOIS DO LOGIN QUANDO A TELA NÃO VEM DO REDIRECT PARA /auth/login (VER RequireAuth)
const Login = ({ destino }) => {
    const [loading, setLoading] = useState(false)
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const from = destino || location.state?.from?.pathname || '/'
    const [showPassword, setShowPassword] = useState(false)
    // Painéis retornados pela API quando o usuário existe em mais de um (409)
    const [paineis, setPaineis] = useState(null)
    const { currentLayout } = useLayout()

    //DESLOGADO EM /auth/login (OU / -> /auth/login) SEM ?a=: ESQUECE O customer-host / customer-host-fixo DE UM ?a=
    //ANTERIOR — SENÃO O LOGIN IA DIRETO PARA AQUELE CLIENTE (panel/login) EM VEZ DO CENTRAL
    useEffect(() => {
        clearCustomerHostWithoutParam()
    }, [location.search])

    //"Cadastre-se!" SÓ NO PAINEL DE UM CLIENTE (?a= OU DOMÍNIO DO CLIENTE) COM "Habilitar cadastro de usuários" LIGADO
    //(panel/login-config). NO LOGIN CENTRAL NÃO EXISTE CLIENTE PARA CADASTRAR. O ?a= VAI JUNTO NO LINK: SEM ELE A VOLTA
    //PARA O LOGIN ESQUECERIA O CLIENTE
    const clienteFixo = getFixedCustomerHost()
    const [cadastroLiberado, setCadastroLiberado] = useState(false)
    useEffect(() => {
        if (!clienteFixo) {
            setCadastroLiberado(false)
            return
        }
        let ativo = true
        axios
            .get(`${import.meta.env.VITE_CAYMAN_API_URL}/panel/login-config`, {
                headers: { 'Customer-Host': getCustomerHost() },
            })
            .then(({ data }) => {
                if (ativo) setCadastroLiberado(data?.success?.response?.data?.cadastro === true)
            })
            .catch(() => {
                if (ativo) setCadastroLiberado(false)
            })
        return () => {
            ativo = false
        }
    }, [clienteFixo])

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            await handleLogin(values)
        },
    })

    const handleLogin = async (values, idPainelCliente = null) => {
        setLoading(true)
        formik.setStatus()

        try {
            if (!login) {
                throw new Error(
                    'Não foi possível concluir a operação. Tente novamente.'
                )
            }

            await login(values.email, values.password, idPainelCliente)

            navigate(from, {
                replace: true,
            })
        } catch (error) {
            if (error?.code === 'MULTIPLE_PANELS') {
                setPaineis(error.paineis)
                formik.setStatus(
                    'Seu usuário existe em mais de um painel. Escolha abaixo qual deseja acessar.'
                )
            } else {
                setPaineis(null)
                formik.setStatus(
                    error?.message || 'E-mail ou senha incorretos.'
                )
            }
            formik.setSubmitting(false)
        }

        setLoading(false)
    }

    const togglePassword = (event) => {
        event.preventDefault()
        setShowPassword(!showPassword)
    }

    return (
        <div className="card max-w-[390px] w-full">
            <form
                className="card-body flex flex-col gap-5 p-10"
                onSubmit={formik.handleSubmit}
                noValidate
            >
                <div className="text-center mb-2">
                    <div className="flex gap-3 mb-2.5 items-center">
                        <img
                            src={PANEL_LOGO}
                            alt="Logo"
                            className="dark:hidden"
                            style={{ width: '135px' }}
                        />
                        <img
                            src={PANEL_LOGO}
                            alt="Logo"
                            className="hidden dark:block"
                            style={{
                                filter: 'brightness(100)',
                                width: '135px',
                            }}
                        />
                    </div>
                </div>

                <h3 className="text-left font-semibold">Acesse seu sistema</h3>

                {formik.status && (
                    <Alert variant={paineis ? 'warning' : 'danger'}>
                        {formik.status}
                    </Alert>
                )}

                {paineis && (
                    <div className="flex flex-col gap-2">
                        {paineis.map((painel) => (
                            <button
                                key={painel.id_painel_cliente}
                                type="button"
                                className="btn btn-light justify-start"
                                disabled={loading}
                                onClick={() =>
                                    handleLogin(
                                        formik.values,
                                        painel.id_painel_cliente
                                    )
                                }
                            >
                                <span className="flex flex-col items-start">
                                    <span className="font-medium">
                                        {painel.cliente}
                                    </span>
                                    <span className="text-2sm text-gray-600">
                                        {painel.dominio}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label htmlFor="login-email" className="form-label text-gray-900 gap-[2px]">
                        E-mail ou login <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            id="login-email"
                            placeholder="Digite seu e-mail ou login"
                            {...formik.getFieldProps('email')}
                            className={clsx('form-control', {
                                'is-invalid':
                                    formik.touched.email && formik.errors.email,
                            })}
                        />
                    </label>
                    {formik.touched.email && formik.errors.email && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.email}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                        <label htmlFor="login-senha" className="form-label text-gray-900 gap-[2px]">
                            Senha <span className="text-danger">*</span>
                        </label>
                        <Link
                            to={comCliente('/auth/reset-password')}
                            className="text-2sm link shrink-0"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>
                    {/* div E NÃO label: O CONTAINER TEM O INPUT E O BOTÃO DE MOSTRAR SENHA, E UM label SÓ PODE
                        NOMEAR UM CONTROLE — O NOME DO CAMPO VEM DO label htmlFor ACIMA */}
                    <div className="input">
                        <input
                            id="login-senha"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite sua senha"
                            autoComplete="off"
                            {...formik.getFieldProps('password')}
                            className={clsx('form-control', {
                                'is-invalid':
                                    formik.touched.password &&
                                    formik.errors.password,
                            })}
                        />

                        <button
                            type="button"
                            className="btn btn-icon"
                            onClick={togglePassword}
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            <KeenIcon
                                icon="eye"
                                className={clsx('text-gray-500', {
                                    hidden: showPassword,
                                })}
                            />
                            <KeenIcon
                                icon="eye-slash"
                                className={clsx('text-gray-500', {
                                    hidden: !showPassword,
                                })}
                            />
                        </button>
                    </div>

                    {formik.touched.password && formik.errors.password && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.password}
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-danger btn-auth flex justify-center grow mb-2.5"
                    disabled={loading || formik.isSubmitting}
                >
                    {loading ? 'Carregando...' : 'Entrar'}
                </button>

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
