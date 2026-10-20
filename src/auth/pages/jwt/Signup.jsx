import { useFormik } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useAuthContext } from '../../useAuthContext'
import { Alert } from '@/components'
import { loginDoCliente } from '@/utils/customerHost'
import { LogoDoAcesso, CampoDoAcesso, CampoSenhaDoAcesso, BotaoDoAcesso } from './CamposDoAcesso'

//CADASTRO NO PAINEL DO CLIENTE: NOME COMPLETO, LOGIN, E-MAIL, SENHA E REPETIÇÃO (panel/signup)
const initialValues = {
    name: '',
    login: '',
    email: '',
    password: '',
    changepassword: '',
}

const signupSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(100, 'Digite no máximo 100 caracteres')
        .required('Campo obrigatório'),
    login: Yup.string()
        .min(3, 'Digite pelo menos 3 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .matches(/^\S+$/, 'O login não pode ter espaços')
        .required('Campo obrigatório'),
    email: Yup.string()
        .email('Formato de e-mail inválido')
        .max(100, 'Digite no máximo 100 caracteres')
        .required('Campo obrigatório'),
    //MESMO MÍNIMO DO PanelSignup.php (6)
    password: Yup.string()
        .min(6, 'Digite pelo menos 6 caracteres')
        .max(50, 'Digite no máximo 50 caracteres')
        .required('Campo obrigatório'),
    changepassword: Yup.string()
        .required('Campo obrigatório')
        .oneOf(
            [Yup.ref('password')],
            'Senha e repetição de senha não conferem'
        ),
})

const Signup = () => {

    const { register } = useAuthContext()
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues,
        validationSchema: signupSchema,
        onSubmit: async (values, { setStatus }) => {

            try {

                await register(values.name, values.login, values.email, values.password, values.changepassword)

                navigate({
                    pathname: '/',
                    search: `?pag=perfil&action=finalizar-cadastro`,
                })

            } catch (error) {
                setStatus(error.message)
            }

        }
    })

    return (
        <div className="card max-w-[370px] w-full">

            <form
                className="card-body flex flex-col gap-5 p-10"
                noValidate
                onSubmit={formik.handleSubmit}
            >

                <LogoDoAcesso className="mb-2.5" />

                <h3 className="text-left font-semibold">Efetuar cadastro</h3>

                {formik.status && (
                    <Alert variant="danger">{formik.status}</Alert>
                )}

                <CampoDoAcesso
                    formik={formik}
                    name="name"
                    id="signup-name"
                    label="Nome completo"
                    placeholder="Digite seu nome completo"
                    type="text"
                    autoComplete="off"
                    validar
                    atualizarAoDigitar
                />

                <CampoDoAcesso
                    formik={formik}
                    name="login"
                    id="signup-login"
                    label="Login"
                    placeholder="Escolha um login"
                    type="text"
                    autoComplete="username"
                    validar
                />

                <CampoDoAcesso
                    formik={formik}
                    name="email"
                    id="signup-email"
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    type="email"
                    autoComplete="off"
                    validar
                    atualizarAoDigitar
                />

                <CampoSenhaDoAcesso formik={formik} name="password" id="signup-password" label="Senha" validar />

                <CampoSenhaDoAcesso formik={formik} name="changepassword" id="signup-changepassword" label="Repetição de senha" validar />

                {/* O formik JÁ MARCA isSubmitting DURANTE O onSubmit (E DESMARCA NO FIM, COM OU SEM ERRO) */}
                <BotaoDoAcesso carregando={formik.isSubmitting}>Finalizar cadastro</BotaoDoAcesso>

                <div className="flex items-center justify-start font-medium">
                    <span className="text-2sm text-gray-600 me-1.5">
                        Já possui uma conta?
                    </span>
                    {/* COM O ?a= DO CLIENTE: /auth/login SEM ELE VOLTARIA PARA O LOGIN CENTRAL */}
                    <Link
                        to={loginDoCliente()}
                        className="text-2sm link"
                    >
                        Efetue login
                    </Link>
                </div>
            </form>
        </div>
    )
}

export { Signup }
