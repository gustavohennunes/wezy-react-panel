    // RESPOSTAS DA PONTE panel/module LIDAS COMO Blob. A MAIORIA É JSON (OU HTML CRU COM REDIRECT DO CARTÃO), MAS
    // ALGUNS CARTÕES DEVOLVEM ARQUIVO (Content-Disposition: CSV, PDF, XML). COM RESPOSTA EM JSON/TEXTO O ARQUIVO
    // CHEGAVA CORROMPIDO E O FRONT MOSTRAVA "Resposta inesperada".

    const TIPOS_DE_TEXTO = ['application/json', 'text/html', 'text/plain', 'text/javascript']

    const tipoDeTexto = (contentType) => TIPOS_DE_TEXTO.some((tipo) => contentType.includes(tipo))

    const nomeDoArquivo = (contentDisposition, contentType) => {

        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
        if (utf8) {
            try {
                return decodeURIComponent(utf8[1].trim())
            } catch {
                return utf8[1].trim()
            }
        }

        const simples = /filename="?([^";]+)"?/i.exec(contentDisposition)
        if (simples) {
            return simples[1].trim()
        }

        const extensao = (contentType.split('/')[1] || 'bin').split(';')[0].trim()
        return `arquivo.${extensao}`

    }

    const baixar = (blob, nome) => {

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = nome
        document.body.appendChild(link)
        link.click()
        link.remove()

        setTimeout(() => URL.revokeObjectURL(url), 10000)

    }

    // TEXTO DO Blob: JSON VIRA OBJETO; HTML/TEXTO CONTINUA STRING (O legacyRedirect PROCURA O window.location NELE)
    export const lerBlob = async (blob) => {

        if (!(blob instanceof Blob)) {
            return blob
        }

        const texto = await blob.text()

        try {
            return JSON.parse(texto)
        } catch {
            return texto
        }

    }

    // DEVOLVE O CORPO DA RESPOSTA OU null QUANDO ERA UM ARQUIVO (JÁ BAIXADO)
    export const lerRespostaApi = async (response) => {

        const contentType        = String(response?.headers?.['content-type'] || '')
        const contentDisposition = String(response?.headers?.['content-disposition'] || '')
        const corpo              = response?.data

        const respostaDeArquivo = /attachment|filename/i.test(contentDisposition) || (contentType !== '' && !tipoDeTexto(contentType))

        if (respostaDeArquivo && corpo instanceof Blob) {
            baixar(corpo, nomeDoArquivo(contentDisposition, contentType))
            return null
        }

        return lerBlob(corpo)

    }
