import useBodyClasses from '@/hooks/useBodyClasses'
import { PanelLayoutProvider, Main } from './'
import { PageDataProvider, usePageData } from '@/context/PageDataContext'
import { ScreenLoader } from '@/components/loaders'
import { LegacySelectEnhancer } from '@/components/form/LegacySelectEnhancer'
import { EmailObrigatorio } from './EmailObrigatorio'
import { LegacyDialogs } from '@/components/legacy/LegacyDialogs'
import { DestravaScroll } from './DestravaScroll'

//LOADER EM TELA CHEIA SÓ QUANDO A RESPOSTA JÁ É UM REDIRECT PARA OUTRO HOST (ex.: acao=Painel, ACESSO AO PAINEL DO
//CLIENTE): O NAVEGADOR AINDA LEVA UM TEMPO PARA SAIR. ANTES QUALQUER acao FORA DE Alterar/Inserir (Dashboard, Fotos...)
//JÁ TROCAVA O LAYOUT INTEIRO PELO LOADER ENQUANTO CARREGAVA, E A SIDEBAR SUMIA. AGORA ESSAS CARREGAM COM O LOADER DO
//CONTEÚDO, COMO OS OUTROS LINKS DO MENU
const PanelBody = () => {
    const { redirecting } = usePageData()

    if (redirecting) {
        return <ScreenLoader />
    }

    return (
        <PanelLayoutProvider>
            <Main />
            <LegacySelectEnhancer />
            <EmailObrigatorio />
            <LegacyDialogs />
            <DestravaScroll />
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
