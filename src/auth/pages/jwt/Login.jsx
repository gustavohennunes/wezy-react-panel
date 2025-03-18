import { useState } from 'react'
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
        .email('Formato de e-mail inválido')
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    password: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    remember: Yup.boolean(),
})

const initialValues = {
    email: '',
    password: '',
    remember: false,
}

const Login = () => {

    const [loading, setLoading] = useState(false)
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/'
    const [showPassword, setShowPassword] = useState(false)
    const { currentLayout } = useLayout()

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            setLoading(true)
            try {
                if (!login) {
                    throw new Error('Não foi possível concluir a operação. Tente novamente.')
                }
                await login(values.email, values.password)
                if (values.remember) {
                    localStorage.setItem('email', values.email)
                } else {
                    localStorage.removeItem('email')
                }
                navigate(from, {
                    replace: true,
                })
            } catch {
                setStatus('E-mail ou senha incorretos.')
                setSubmitting(false)
            }
            setLoading(false)
        }
    })
    
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
                        <img src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg" className="dark:hidden" style={{width: '135px'}} />
                        <img src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg" className="hidden dark:block" style={{filter: "brightness(100)", width: '135px'}} />
                        <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                            |
                        </div>
                        <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                            Revenda
                        </div>
                    </div>

                </div>

                <h3 className="text-left font-semibold">
                    Acesse sua revenda
                </h3>

                {formik.status && (
                    <Alert variant="danger">{formik.status}</Alert>
                )}

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900 gap-[2px]">
                        E-mail <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            placeholder="Digite seu e-mail"
                            autoComplete="off"
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
                        <label className="form-label text-gray-900 gap-[2px]">
                            Senha <span className="text-danger">*</span>
                        </label>
                        <Link
                            to="/auth/reset-password"
                            className="text-2sm link shrink-0"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>
                    <label className="input">
                        <input
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
                            className="btn btn-icon"
                            onClick={togglePassword}
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
                    </label>
                    {formik.touched.password && formik.errors.password && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.password}
                        </span>
                    )}
                </div>

                <label className="checkbox-group">
                    <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        {...formik.getFieldProps('remember')}
                    />
                    <span className="checkbox-label">Lembrar este dispositivo</span>
                </label>

                <button
                    type="submit"
                    className="btn btn-danger flex justify-center grow mb-2.5"
                    disabled={loading || formik.isSubmitting}
                >
                    {loading ? 'Carregando...' : 'Entrar'}
                </button>

                <div className="flex items-center justify-start font-medium">

                    <span className="text-2sm text-gray-600 me-1.5">
                        Não tem uma conta?
                    </span>
                    <Link
                        to="/auth/signup"
                        className="text-2sm link"
                    >
                        Cadastre-se!
                    </Link>
                </div>

            </form>

        </div>

    )

}

export { Login }
