    //CHAVE DO CONTROLADOR DE LINHAS CONDICIONAIS: CLASSE "valid valid-xxx" -> "xxx"
    export const chaveValid = (className) => /(?:^|\s)valid-([^\s]+)/.exec(className || '')?.[1] || null

    //style="display:none; width:50%" DO CARTÃO (ex.: planos-comerciais DO 360): O React SÓ ACEITA style COMO OBJETO E O
    //TEXTO DERRUBAVA O FORMULÁRIO INTEIRO (ERRO #62). VIRA { display: 'none', width: '50%' }; --var FICA COMO ESTÁ
    const estiloComoObjeto = (texto) => {
        const estilo = {}
        texto.split(';').forEach((declaracao) => {
            const posicao = declaracao.indexOf(':')
            if (posicao < 1) return
            const propriedade = declaracao.slice(0, posicao).trim()
            const valor       = declaracao.slice(posicao + 1).trim()
            if (!propriedade || valor === '') return
            const chave = propriedade.startsWith('--') ? propriedade : propriedade.replace(/-([a-z])/g, (_, letra) => letra.toUpperCase())
            estilo[chave] = valor.replace(/\s*!important$/i, '')
        })
        return estilo
    }

    //ATRIBUTOS DA LINHA (row_attr). ANTES SEPARAVA POR ESPAÇO E QUEBRAVA VALOR COM ESPAÇO: data-style="Primária Hover"
    //VIRAVA data-style="Primária" (O "Abrir parâmetros" DA FOLHA DE ESTILO NÃO ACHAVA AS LINHAS DO ESTILO)
    export const parseAttributes = (attrString) => {

        const attributes = {}

        for (const [, key, aspasDuplas, aspasSimples, semAspas] of String(attrString || '').matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
            attributes[key] = aspasDuplas ?? aspasSimples ?? semAspas ?? ''
        }

        if (typeof attributes.style === 'string') {
            attributes.style = estiloComoObjeto(attributes.style)
        }

        return attributes

    }

    //LINHA CONDICIONAL: TODOS OS data-valid-* PRECISAM CASAR (ex.: "Métodos liberados" EXIGE
    //data-valid-ativar-api="ok" E data-valid-limitar-metodos="ok"). ANTES SÓ O PRIMEIRO
    //ERA CONFERIDO E A LINHA APARECIA COM APENAS UMA DAS CONDIÇÕES ATIVA.
    //COMO O ajustaValidFromTr DO painel.js: "1|2" ACEITA QUALQUER UM DOS VALORES, E CONDIÇÃO SEM CAMPO
    //CONTROLADOR NO FORMULÁRIO NÃO ESCONDE A LINHA
    export const linhaEscondidaPorValid = (atributos, validRows, controladores) =>
        Object.keys(atributos)
            .filter((attr) => attr.startsWith('data-valid-'))
            .some((attr) => {
                const chave = attr.replace('data-valid-', '')
                if (!controladores.has(chave)) return false
                const permitidos = new Set(String(atributos[attr] ?? '').split('|'))
                return !permitidos.has(String(validRows[chave] ?? ''))
            })
