import clsx from 'clsx'
import { useFormik } from 'formik'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useAuthContext } from '../../useAuthContext'
import { toAbsoluteUrl } from '@/utils'
import { Alert, KeenIcon } from '@/components'
import { useLayout } from '@/providers'

const initialValues = {
    email: '',
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
            "Senha e confirmação de senha não conferem"
        ),
    acceptTerms: Yup.bool()
        .oneOf([true], 'Você precisa aceitar os termos de uso'),
})

const Signup = () => {

    const [loading, setLoading]                         = useState(false)
    const { register }                                  = useAuthContext()
    const navigate                                      = useNavigate()
    const location                                      = useLocation()
    const from                                          = location.state?.from?.pathname || '/'
    const [showPassword, setShowPassword]               = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { currentLayout }                             = useLayout()

    const formik = useFormik({
        initialValues,
        validationSchema: signupSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {

            setLoading(true);

            try {

                if (!register) {
                    throw new Error('Não foi possível concluir a operação. Tente novamente.')
                }

                console.log(values.acceptTerms);
                
                await register(
                    values.name,
                    values.email,
                    values.phone,
                    values.password,
                    values.changepassword,
                    values.acceptTerms
                );
                
                navigate(from, {
                    replace: true,
                });

            } catch (error) {
                console.error(error)
                setStatus('As informações de cadastro estão incorretas.')
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

                    <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
                        Cadastro revenda Vymber
                    </h3>

                    <div className="flex items-center justify-center font-medium">

                        <span className="text-2sm text-gray-600 me-1.5">
                            Já possuí uma conta?
                        </span>
                        <Link
                            to={
                                currentLayout?.name === 'auth-branded'
                                    ? '/auth/login'
                                    : '/auth/classic/login'
                            }
                            className="text-2sm link"
                        >
                            Efetue login
                        </Link>

                    </div>

                </div>

                {formik.status && (
                    <Alert variant="danger">{formik.status}</Alert>
                )}

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900">Nome</label>

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
                                }, {
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

                    <label className="form-label text-gray-900">E-mail</label>

                    <label className="input">
                        <input
                            placeholder="Digite seu e-mail"
                            type="email"
                            autoComplete="off"
                            {...formik.getFieldProps('email')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid': formik.touched.email && formik.errors.email,
                                }, {
                                    'is-valid': formik.touched.email && !formik.errors.email,
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

                    <label className="form-label text-gray-900">Telefone (Whatsapp)</label>

                    <label className="input">
                        <input
                            placeholder="Digite seu telefone"
                            type="tel"
                            maxLength={15}
                            autoComplete="off"
                            {...formik.getFieldProps('phone')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid': formik.touched.phone && formik.errors.phone,
                                }, {
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

                    <label className="form-label text-gray-900">Senha</label>

                    <label className="input">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=""
                            autoComplete="off"
                            {...formik.getFieldProps('password')}
                            className={clsx(
                                'form-control bg-transparent',
                                {
                                    'is-invalid':
                                        formik.touched.password &&
                                        formik.errors.password,
                                },
                                {
                                    'is-valid':
                                        formik.touched.password &&
                                        !formik.errors.password,
                                }
                            )}
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

                <div className="flex flex-col gap-1">

                    <label className="form-label text-gray-900">
                        Repetição de senha
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

                    {formik.touched.changepassword && formik.errors.changepassword && (
                        <span
                            role="alert"
                            className="text-danger text-xs mt-1"
                        >
                            {formik.errors.changepassword}
                        </span>
                    )}

                </div>

                <label className="checkbox-group flex-col !align-start">

                    <div className="flex gap-2.5">
                        
                        <input
                            className="checkbox checkbox-sm"
                            type="checkbox"
                            {...formik.getFieldProps('acceptTerms')}
                        />
                        <span className="checkbox-label">
                            Eu aceito os {' '}
                            <Link to="#" className="text-2sm link">
                                Termos de uso
                            </Link>
                        </span>

                    </div>

                    {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                        <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.acceptTerms}
                        </span>
                    )}

                </label>


                <button
                    type="submit"
                    className="btn btn-danger flex justify-center grow"
                    disabled={loading || formik.isSubmitting}
                >
                    {loading ? 'Carregando...' : 'Finalizar cadastro'}
                </button>

            </form>

        </div>

    );

}

export { Signup }
