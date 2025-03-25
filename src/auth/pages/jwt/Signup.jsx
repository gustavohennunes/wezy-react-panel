import clsx from 'clsx'
import { useFormik } from 'formik'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useAuthContext } from '../../useAuthContext'
import { Alert, KeenIcon } from '@/components'
import { useLayout } from '@/providers'
import { IMaskInput } from 'react-imask'

const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    changepassword: '',
    acceptTerms: false,
}

const signupSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    email: Yup.string()
        .email('Formato de e-mail inválido')
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    phone: Yup.string()
        .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato de telefone inválido')
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    password: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    changepassword: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório')
        .oneOf(
            [Yup.ref('password')],
            'Senha e confirmação de senha não conferem'
        ),
    acceptTerms: Yup.bool().oneOf(
        [true],
        'Você precisa aceitar os termos de uso'
    ),
})

const Signup = () => {

    const [loading, setLoading] = useState(false)
    const { register } = useAuthContext()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const formik = useFormik({
        initialValues,
        validationSchema: signupSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {

            setLoading(true)

            try {

                if (!register) {

                    throw new Error(
                        'Não foi possível concluir a operação. Tente novamente.'
                    )

                }

                await register(
                    values.name,
                    values.email,
                    values.phone,
                    values.password,
                    values.changepassword,
                    values.acceptTerms
                )

                navigate({
                    pathname: '/',
                    search: `?pag=perfil&action=finalizar-cadastro`,
                })

            } catch (error) {

                setStatus(error.message)

                setSubmitting(false)

                setLoading(false)

            }

        }
    })

    const togglePassword = (event) => {
        event.preventDefault()
        setShowPassword(!showPassword)
    }

    const toggleConfirmPassword = (event) => {
        event.preventDefault()
        setShowConfirmPassword(!showConfirmPassword)
    }

    return (
        <div className="card max-w-[370px] w-full">
            <form
                className="card-body flex flex-col gap-5 p-10"
                noValidate
                onSubmit={formik.handleSubmit}
            >
                <div className="text-center mb-2.5">
                    <div className="flex gap-3 mb-2.5 items-center">
                        <img
                            src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                            className="dark:hidden"
                            style={{ width: '135px' }}
                        />
                        <img
                            src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                            className="hidden dark:block"
                            style={{
                                filter: 'brightness(100)',
                                width: '135px',
                            }}
                        />
                        <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                            |
                        </div>
                        <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                            Revenda
                        </div>
                    </div>
                </div>

                <h3 className="text-left font-semibold">Efetuar cadastro</h3>

                {formik.status && (
                    <Alert variant="danger">{formik.status}</Alert>
                )}

                <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-[2px]">
                        Nome <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            placeholder="Digite seu nome completo"
                            type="text"
                            autoComplete="off"
                            {...formik.getFieldProps('name')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid': formik.touched.name && formik.errors.name,
                                },
                                {
                                    'is-valid': formik.touched.name && !formik.errors.name,
                                }
                            )}
                        />
                    </label>

                    {formik.touched.name && formik.errors.name && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.name}
                        </span>
                    )}

                </div>

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900 gap-[2px]">
                        E-mail <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            placeholder="Digite seu e-mail"
                            type="email"
                            autoComplete="off"
                            {...formik.getFieldProps('email')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid':
                                        formik.touched.email &&
                                        formik.errors.email,
                                },
                                {
                                    'is-valid':
                                        formik.touched.email &&
                                        !formik.errors.email,
                                }
                            )}
                        />
                    </label>

                    {formik.touched.email && formik.errors.email && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.email}
                        </span>
                    )}

                </div>

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900 gap-[2px]">
                        Telefone (Whatsapp){' '}
                        <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <IMaskInput
                            mask="(00) 00000-0000"
                            placeholder="Digite seu telefone"
                            type="tel"
                            maxLength={15}
                            autoComplete="off"
                            {...formik.getFieldProps('phone')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid': formik.touched.phone && formik.errors.phone,
                                },
                                {
                                    'is-valid': formik.touched.phone && !formik.errors.phone,
                                }
                            )}
                        />
                    </label>

                    {formik.touched.phone && formik.errors.phone && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.phone}
                        </span>
                    )}

                </div>

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900 gap-[2px]">
                        Senha <span className="text-danger">*</span>
                    </label>

                    <label className="input">

                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=""
                            autoComplete="off"
                            {...formik.getFieldProps('password')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid': formik.touched.password && formik.errors.password,
                                },
                                {
                                    'is-valid': formik.touched.password && !formik.errors.password,
                                }
                            )}
                        />
                        <button
                            type="button"
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

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900 gap-[2px]">
                        Repetição de senha{' '}
                        <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder=""
                            autoComplete="off"
                            {...formik.getFieldProps('changepassword')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid':
                                        formik.touched.changepassword &&
                                        formik.errors.changepassword,
                                },
                                {
                                    'is-valid':
                                        formik.touched.changepassword &&
                                        !formik.errors.changepassword,
                                }
                            )}
                        />
                        <button
                            type="button"
                            className="btn btn-icon"
                            onClick={toggleConfirmPassword}
                        >
                            <KeenIcon
                                icon="eye"
                                className={clsx('text-gray-500', {
                                    hidden: showConfirmPassword,
                                })}
                            />
                            <KeenIcon
                                icon="eye-slash"
                                className={clsx('text-gray-500', {
                                    hidden: !showConfirmPassword,
                                })}
                            />
                        </button>
                    </label>

                    {formik.touched.changepassword &&
                        formik.errors.changepassword && (
                            <span
                                role="alert"
                                className="text-danger text-xs mt-1"
                            >
                                {formik.errors.changepassword}
                            </span>
                        )}
                </div>

                <label className="checkbox-group flex-col align-start">
                    <div className="flex gap-2.5">
                        <input
                            className="checkbox checkbox-sm"
                            type="checkbox"
                            {...formik.getFieldProps('acceptTerms')}
                        />
                        <span className="checkbox-label">
                            Eu aceito os{' '}
                            <Link to="#" className="text-2sm link">
                                Termos de uso
                            </Link>
                        </span>
                    </div>

                    {formik.touched.acceptTerms &&
                        formik.errors.acceptTerms && (
                            <span
                                role="alert"
                                className="text-danger text-xs mt-1"
                            >
                                {formik.errors.acceptTerms}
                            </span>
                        )}
                </label>

                <button
                    type="submit"
                    className="btn btn-danger flex justify-center grow mb-2.5"
                    disabled={loading || formik.isSubmitting}
                >
                    {loading ? 'Carregando...' : 'Finalizar cadastro'}
                </button>

                <div className="flex items-center justify-start font-medium">
                    <span className="text-2sm text-gray-600 me-1.5">
                        Já possuí uma conta?
                    </span>
                    <Link to="/auth/login" className="text-2sm link">
                        Efetue login
                    </Link>
                </div>
            </form>
        </div>
    )
}

export { Signup }
