    import { chaveValid } from './atributosDaLinha'

    const opcaoSelecionada = (option) => option.selected === true || option.selected === 'selected'

    //CONTROLADORES DE LINHA CONDICIONAL QUE VÊM CRUS NO HTML DE UM CAMPO aut (ex.: CUSTOM FIELDS DO BACK-END DAS SECTIONS:
    //<input type="radio" class="forms obg valid valid-forma-apresentacao-0">, E AS LINHAS COM data-valid-forma-apresentacao-0="4").
    //SEM ISSO O FormSection NÃO CONHECIA A CHAVE E MOSTRAVA TODAS AS LINHAS DE UMA VEZ. DEVOLVE [{ chave, valor inicial }]
    const controladoresDoHtml = (html) => {

        if (!html.includes('valid-') || typeof DOMParser === 'undefined') return []

        const documento = new DOMParser().parseFromString(html, 'text/html')

        return Array.from(documento.querySelectorAll('input, select, textarea')).reduce((lista, campo) => {

            const chave = chaveValid(campo.getAttribute('class'))
            if (!chave) return lista

            let valor = campo.value || ''
            if (campo.type === 'radio' || campo.type === 'checkbox') {
                valor = campo.checked ? campo.value : ''
            }

            lista.push({ chave, valor: String(valor) })
            return lista

        }, [])

    }

    //CAMPOS QUE CONTROLAM LINHAS (classe "valid valid-xxx") E O VALOR INICIAL DE CADA UM
    export const lerControladores = (fields) => {

        const chaves  = new Set()
        const valores = {}

        fields.forEach((field) => {

            if (field.type === 'Rdo' || field.type === 'Ckb') {

                ;(Array.isArray(field.field) ? field.field : []).forEach((item) => {
                    const chave = chaveValid(item?.class)
                    if (!chave) return
                    chaves.add(chave)
                    if (!(chave in valores)) valores[chave] = ''
                    if (item.checked && item.value) valores[chave] = String(item.value)
                })

            } else if (field.type === 'aut' && typeof field.field?.extra_html === 'string') {

                controladoresDoHtml(field.field.extra_html).forEach(({ chave, valor }) => {
                    chaves.add(chave)
                    if (!(chave in valores) || valor !== '') valores[chave] = valor
                })

            } else if (field.field && !Array.isArray(field.field)) {

                const chave = chaveValid(field.field.class)
                if (!chave) return
                chaves.add(chave)
                const marcada = Array.isArray(field.field.options) ? field.field.options.find(opcaoSelecionada) : null
                valores[chave] = String(field.field.value || marcada?.value || '')

            }

        })

        return { controladores: chaves, validIniciais: valores }

    }

    //VALOR DE UM CONTROLADOR CRU DO HTML LEGADO NO EVENTO change; undefined = RADIO DESMARCADO (NÃO MUDA NADA)
    export const valorDoControlador = (campo) => {
        if (campo.type === 'radio') return campo.checked ? String(campo.value) : undefined
        if (campo.type === 'checkbox') return campo.checked ? String(campo.value) : ''
        return String(campo.value)
    }

    //ABA DE CATEGORIA: CARTÃO QUE DIVIDE O FORMULÁRIO EM ABAS NA MESMA TELA (ex.: projetos-css-padrao, "Cores | Tipografias |
    //Botões | CSS | JS | Outros"). O LINK DA ABA É Javascript:openCategory('colors') E CADA LINHA TEM data-category="colors";
    //NO LEGADO O openCategory ESCONDIA AS <tr> DAS OUTRAS. AQUI A ABA TROCA O ESTADO E O FormSection ESCONDE
    const categoriaDaAba = (url) =>
        /^\s*javascript:\s*openCategory\(\s*(?:'|"|&#0?39;|&quot;)([\w-]+)/i.exec(url || '')?.[1] || null

    //ABAS DO CARTÃO (HTML DOS <a> EM buttons.form) VIRAM OBJETOS. ABA DE CATEGORIA SÓ GUARDA A categoria: QUEM
    //A ATIVA É O FormContext. DEVOLVE AS ABAS E AS CATEGORIAS NA ORDEM EM QUE APARECEM
    export const lerAbas = (html) => {

        const abas = { before: [], after: [] }
        const categorias = []

        html.split('</a>').forEach((tab) => {

            const depoisDoHref = tab.split('href="')[1]
            const tabUrl  = depoisDoHref ? depoisDoHref.split('"')[0] : ''
            const tabName = depoisDoHref ? depoisDoHref.split('>')[1] : ''

            const categoria = categoriaDaAba(tabUrl)

            if (categoria) {

                categorias.push(categoria)
                abas.before.push({ content: tabName, categoria })

            } else if (tabUrl) {

                //target="_blank" DO setButtonsModule (BOTÃO DECLARADO COMO array('Nome', true) NO CARTÃO, ex.: "Acessar
                //Painel" DO menuModulos) — ANTES SE PERDIA AQUI E O BOTÃO ABRIA NA MESMA ABA
                const tabTarget = /\btarget=["']([^"']+)["']/i.exec(tab)?.[1]

                abas.before.push({
                    content: tabName,
                    url: tabUrl,
                    ...(tabTarget ? { target: tabTarget } : {}),
                })

            }

        })

        return { abas, categorias }

    }

    //TÍTULO DO Cab: "Título // Subtítulo"
    const tituloDoCab = (field) => {
        const partes = field?.field?.value?.title?.split('//')
        if (partes?.length > 1) return { title: partes[0].trim(), subTitle: partes[1].trim() }
        return { title: field.field.value.title, subTitle: '' }
    }

    //SEÇÕES (CARDS) DO FORMULÁRIO: CADA Cab ABRE UMA, E OS CAMPOS SEGUINTES ENTRAM NELA
    export const montaSecoes = (fields) => {

        const secoes = []
        let atual = null

        fields.forEach((field) => {

            //Cab COM ATRIBUTO CONDICIONAL (ex.: data-modo-abertura="2" NO CARD DE CLIENTES) NÃO ABRE CARD
            //NOVO: NO PAINEL ANTIGO ELE ERA UMA <tr> DA MESMA TABELA, ESCONDIDA SOZINHA PELO JS DO CARD
            //SEM LEVAR OS CAMPOS SEGUINTES. AQUI VIRA UMA LINHA DE TÍTULO DENTRO DA SEÇÃO ATUAL.
            //data-category NÃO CONTA: É A ABA DA SEÇÃO (VER categoriaDaAba), E CADA Cab DELA É UM CARD PRÓPRIO
            const cabCondicional = field.type === 'Cab' && atual &&
                /\bdata-(?!type=|category=)[\w-]+=/.test(field.row_attr || '')

            if (field.type === 'Cab' && !cabCondicional) {

                if (atual) secoes.push(atual)

                atual = {
                    ...tituloDoCab(field),
                    number: field.field.value.number,
                    categoria: /\bdata-category=["']?([\w-]+)/.exec(field.row_attr || '')?.[1] || null,
                    fields: [],
                }

                return

            }

            //CAMPO ANTES DO PRIMEIRO Cab: ABRE UMA SEÇÃO SEM CABEÇALHO EM VEZ
            //DE DESCARTÁ-LO. O CARD NÃO É OBRIGADO A COMEÇAR COM Cab.
            if (!atual) {
                atual = { title: '', subTitle: '', number: '', fields: [] }
            }

            atual.fields.push(field)

        })

        if (atual) secoes.push(atual)

        return secoes

    }
