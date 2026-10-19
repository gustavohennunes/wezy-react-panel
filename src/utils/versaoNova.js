    // CHUNK SOB DEMANDA QUE SUMIU DO SERVIDOR: A ABA FOI ABERTA COM UM BUILD ANTERIOR E O import() (ex.: O ace DO EDITOR)
    // PEDE UM ARQUIVO COM O HASH ANTIGO. RECARREGAR TRAZ O index.html NOVO, QUE APONTA PARA OS ASSETS ATUAIS. A TRAVA EVITA
    // LOOP SE O ERRO FOR OUTRO (UM RECARREGAMENTO A CADA 30s NO MÁXIMO)

    const CHAVE = 'versao-nova-recarregada-em'

    const ERRO_DE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Expected a JavaScript/i

    export const chunkAusente = (erro) => ERRO_DE_CHUNK.test(String(erro?.message || erro || ''))

    // true QUANDO VAI RECARREGAR (QUEM CHAMOU NÃO PRECISA MOSTRAR ERRO)
    export const recarregarSeVersaoNova = (erro) => {

        if (!chunkAusente(erro)) return false

        let ultima = 0
        try {
            ultima = Number(sessionStorage.getItem(CHAVE) || 0)
        } catch {
            ultima = 0
        }

        if (Date.now() - ultima < 30000) return false

        try {
            sessionStorage.setItem(CHAVE, String(Date.now()))
        } catch {
            //SEM sessionStorage: RECARREGA MESMO ASSIM (A TRAVA SÓ EVITA LOOP)
        }

        window.location.reload()
        return true

    }
