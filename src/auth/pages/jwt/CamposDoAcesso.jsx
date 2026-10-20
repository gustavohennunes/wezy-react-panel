import clsx from 'clsx'
import { useState } from 'react'
import { PANEL_LOGO } from '@/config/branding'
import { KeenIcon } from '@/components'

// PEÇAS DAS TELAS DE ACESSO (LOGIN E CADASTRO)

const LogoDoAcesso = ({ className = 'mb-2' }) => (
    <div className={clsx('text-center', className)}>
        <div className="flex gap-3 mb-2.5 items-center">
            <img src={PANEL_LOGO} alt="Logo" className="dark:hidden" style={{ width: '135px' }} />
            <img
                src={PANEL_LOGO}
                alt="Logo"
                className="hidden dark:block"
                style={{ filter: 'brightness(100)', width: '135px' }}
            />
        </div>
    </div>
)

//validar: COM O CAMPO TOCADO E SEM ERRO, A BORDA FICA VERDE (is-valid) — USADO NO CADASTRO
const classeDoCampo = (formik, name, validar) => {
    const tocado = formik.touched[name]
    const erro   = formik.errors[name]
    return clsx('form-control', { 'bg-transparent': validar, 'is-invalid': tocado && erro, 'is-valid': validar && tocado && !erro })
}

const ErroDoCampo = ({ formik, name }) =>
    formik.touched[name] && formik.errors[name] ? (
        <span role="alert" className="text-danger text-xs mt-1">
            {formik.errors[name]}
        </span>
    ) : null

const RotuloDoCampo = ({ id, children }) => (
    <label htmlFor={id} className="form-label text-gray-900 gap-[2px]">
        {children} <span className="text-danger">*</span>
    </label>
)

//atualizarAoDigitar: O onInput TAMBÉM GRAVA NO FORMIK (O PREENCHIMENTO AUTOMÁTICO DO NAVEGADOR NEM SEMPRE DISPARA O onChange)
const CampoDoAcesso = ({ formik, name, id, label, placeholder, type, autoComplete, validar = false, atualizarAoDigitar = false }) => (
    <div className="flex flex-col gap-1">

        <RotuloDoCampo id={id}>{label}</RotuloDoCampo>

        <label className="input">
            <input
                id={id}
                placeholder={placeholder}
                type={type}
                autoComplete={autoComplete}
                onInput={atualizarAoDigitar ? (e) => formik.setFieldValue(name, e.target.value) : undefined}
                {...formik.getFieldProps(name)}
                className={classeDoCampo(formik, name, validar)}
            />
        </label>

        <ErroDoCampo formik={formik} name={name} />

    </div>
)

const CampoSenhaDoAcesso = ({ formik, name, id, label, placeholder = '', validar = false }) => {

    const [visivel, setVisivel] = useState(false)

    return (
        <div className="flex flex-col gap-1">

            <RotuloDoCampo id={id}>{label}</RotuloDoCampo>

            {/* div E NÃO label: O CONTAINER TEM O INPUT E O BOTÃO DE MOSTRAR SENHA, E UM label SÓ PODE
                NOMEAR UM CONTROLE — O NOME DO CAMPO VEM DO label htmlFor ACIMA */}
            <div className="input">
                <input
                    id={id}
                    type={visivel ? 'text' : 'password'}
                    placeholder={placeholder}
                    autoComplete="off"
                    {...formik.getFieldProps(name)}
                    className={classeDoCampo(formik, name, validar)}
                />

                <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => setVisivel((atual) => !atual)}
                    aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: visivel })} />
                    <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !visivel })} />
                </button>
            </div>

            <ErroDoCampo formik={formik} name={name} />

        </div>
    )

}

const BotaoDoAcesso = ({ carregando, children }) => (
    <button
        type="submit"
        className="btn btn-danger btn-auth flex justify-center grow mb-2.5"
        disabled={carregando}
    >
        {carregando ? 'Carregando...' : children}
    </button>
)

export { LogoDoAcesso, CampoDoAcesso, CampoSenhaDoAcesso, BotaoDoAcesso }
