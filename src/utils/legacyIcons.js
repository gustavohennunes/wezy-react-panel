    //ORIGEM DO PAINEL LEGADO (assets como css/icons.css e o sprite de ícones)
    export const LEGACY_ORIGIN = (() => {
        try {
            return new URL(import.meta.env.VITE_CAYMAN_API_URL).origin
        } catch {
            return 'https://painel.wezy.com.br'
        }
    })()

    //CARREGA O CSS DE ÍCONES (sprite) DO PAINEL LEGADO UMA ÚNICA VEZ — AS URLS RELATIVAS
    //DENTRO DELE (../imagens/icons-black.svg) RESOLVEM CONTRA O HOST DO PAINEL
    export const injectLegacyIconsCss = () => {

        if (document.getElementById('legacy-icons-css')) return

        //SPRITE BRANCO (MESMO LAYOUT DO PRETO) USADO NO DARK MODE — VER legacy-compat.css
        document.documentElement.style.setProperty('--legacy-icons-white', `url(${LEGACY_ORIGIN}/imagens/icons-white.svg)`)

        //JÁ BAIXA E DECODIFICA O SPRITE BRANCO AGORA: SEM ISSO O DOWNLOAD E O PRIMEIRO DESENHO
        //ACONTECIAM NO CLIQUE DO MODO ESCURO, TRAVANDO A TROCA DE TEMA
        const sprite = new Image()
        sprite.src = `${LEGACY_ORIGIN}/imagens/icons-white.svg`
        sprite.decode?.().catch(() => {})

        const link = document.createElement('link')
        link.id   = 'legacy-icons-css'
        link.rel  = 'stylesheet'
        link.href = LEGACY_ORIGIN + '/css/icons.css'
        document.head.appendChild(link)

    }
