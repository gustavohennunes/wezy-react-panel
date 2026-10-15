import clsx from 'clsx'
import { PANEL_LOGO } from '@/config/branding'
import { useFormik } from 'formik'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/auth/useAuthContext'
import { Alert, KeenIcon } from '@/components'
import { useLayout } from '@/providers'
import { AxiosError } from 'axios'

const initialValues = {
    email: '',
}

const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Formato de e-mail inválido')
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
})

const ResetPassword = () => {
    const [loading, setLoading] = useState(false)
    const [hasErrors, setHasErrors] = useState(undefined)
    const { requestPasswordResetLink } = useAuthContext()
    const { currentLayout } = useLayout()
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues,
        validationSchema: forgotPasswordSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            
            // setLoading(true)
            // setHasErrors(undefined)

            setStatus('E-mai de recuperação enviado! Consulte sua caixa de e-mails!')
            setHasErrors(false)
            setLoading(false)
            setSubmitting(false)
            /*
            try {

                if (!requestPasswordResetLink) {
                    throw new Error(
                        'Não foi possível concluir a operação. Tente novamente.'
                    )
                }

                await requestPasswordResetLink(values.email)

                setHasErrors(false)
                setLoading(false)

                const params = new URLSearchParams()

                params.append('email', values.email)

                navigate({
                    pathname: '/auth/reset-password/check-email',
                    search: params.toString(),
                })

            } catch (error) {

                if (error instanceof AxiosError && error.response) {
                    setStatus(error.response.data.message)
                } else {
                    setStatus('Erro ao alterar senha. Tente novamente.')
                }

                setHasErrors(true)
                setLoading(false)
                setSubmitting(false)
            }*/

        },
    })

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

                <h3 className="text-left font-semibold">Recupere sua senha</h3>

                {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

                {hasErrors === false && (
                    <Alert variant="success">
                        E-mail enviado! Confira sua caixa de e-mails para
                        continuar.
                    </Alert>
                )}

                <div className="flex flex-col gap-1">
                    <label htmlFor="reset-email" className="form-label text-gray-900 gap-[2px]">
                        E-mail <span className="text-danger">*</span>
                    </label>

                    <label className="input">
                        <input
                            id="reset-email"
                            type="email"
                            placeholder="Insira seu e-mail"
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

                <div className="flex flex-col gap-5 items-stretch">
                    <button
                        type="submit"
                        className="btn btn-danger btn-auth flex justify-center grow mb-2.5"
                        disabled={loading || formik.isSubmitting}
                    >
                        {loading ? 'Carregando...' : 'Enviar'}
                    </button>

                    <Link
                        to="/auth/login"
                        className="flex items-center align-start text-sm gap-2 text-gray-700 hover:text-primary"
                    >
                        <KeenIcon icon="black-left" />
                        Voltar para login
                    </Link>
                </div>
            </form>
        </div>
    )
}

export { ResetPassword }
