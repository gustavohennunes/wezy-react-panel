import { useSearchParams } from 'react-router-dom'
import useBodyClasses from '@/hooks/useBodyClasses'
import { PanelLayoutProvider, Main } from './'
import { PageDataProvider, usePageData } from '@/context/PageDataContext'
import { ScreenLoader } from '@/components/loaders'
import { LegacySelectEnhancer } from '@/components/form/LegacySelectEnhancer'

//acao QUE ABREM TELA DE FORMULÁRIO. AS DEMAIS (ex.: Painel, Phpmyadmin, InterfaceWezy) COSTUMAM
//SER LINKS QUE O CARD RESPONDE COM exit(loc(...)) — ATÉ A API RESPONDER, MOSTRA SÓ O LOADER
//EM TELA CHEIA PARA O USUÁRIO NÃO VER O PAINEL ANTES DO REDIRECT
const ACOES_DE_TELA = ['Alterar', 'Inserir']

const PanelBody = () => {
    const { loading, redirecting } = usePageData()
    const [searchParams] = useSearchParams()

    const acao = searchParams.get('acao')
    const acaoDeRedirect = acao && !ACOES_DE_TELA.includes(acao)

    if (redirecting || (acaoDeRedirect && loading)) {
        return <ScreenLoader />
    }

    return (
        <PanelLayoutProvider>
            <Main />
            <LegacySelectEnhancer />
        </PanelLayoutProvider>
    )
}

const PanelLayout = () => {
    useBodyClasses(`
    [--tw-page-bg:#F6F6F9]
    [--tw-page-bg-dark:var(--tw-coal-200)]
    [--tw-content-bg:var(--tw-light)]
    [--tw-content-bg-dark:var(--tw-coal-500)]
    [--tw-content-scrollbar-color:#e8e8e8]
    [--tw-header-height:60px]
    [--tw-sidebar-width:270px]
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
    lg:overflow-hidden
  `)
    return (
        <PageDataProvider>
            <PanelBody />
        </PageDataProvider>
    )
}
export { PanelLayout }
