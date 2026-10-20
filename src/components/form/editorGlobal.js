    import { limparGlobal } from '@/utils/limparGlobal'

    // CAMPOS COM EDITOR DE CÓDIGO (ACE) E O window.editor QUE O JS DOS CARTÕES USA — VER FormCodeEditor

    //PÁGINAS E CAMPOS COM EDITOR NO LEGADO
    const PAGINAS_COM_ACAO = new Set(['modulos', 'modulos-versoes', 'planos-itens', 'componentes', 'projetos-paginas-sections', 'actions-pages', 'formulario-webhooks', 'commerce-custom-css', 'paginas-avulsas', 'planos-comerciais'])
    const PAGINAS_SEMPRE   = new Set(['projetos-paginas-sections-js', 'projetos-paginas-sections-css', 'projetos-css-padrao', 'actions-pages', 'configuracoes-core', 'projeto-404'])
    const CAMPOS           = new Set(['TxtConteudo', 'TxtConteudoFinal', 'TxtConteudo_json', 'TxtConteudo_js'])

    //HIDDEN QUE O prePost DO CARTÃO LÊ (O JS DO CARTÃO COPIAVA O EDITOR PARA ELE ANTES DO ENVIO). TxtConteudo_js: JS DO
    //PROJETO NA FOLHA DE ESTILO (projetos-css-padrao, $post['HdnConteudo_js'])
    export const HIDDEN_DO_CARTAO = { TxtConteudo: 'HdnConteudo', TxtConteudo_js: 'HdnConteudo_js' }

    export const temEditorDeCodigo = (fieldName) => {
        if (!CAMPOS.has(fieldName)) return false
        const params = new URLSearchParams(window.location.search)
        const pag    = params.get('pag') || params.get('slug') || ''
        return PAGINAS_SEMPRE.has(pag) || (PAGINAS_COM_ACAO.has(pag) && (params.get('acao') || '') !== '')
    }

    //LINGUAGEM PELA PÁGINA (O JS DE CADA CARTÃO TROCAVA O MODO DO ACE)
    export const modoDoEditor = (fieldName) => {
        if (fieldName === 'TxtConteudo_json') return 'json'
        if (fieldName === 'TxtConteudo_js') return 'javascript'
        const params = new URLSearchParams(window.location.search)
        const pag    = params.get('pag') || params.get('slug') || ''
        if (/-js$/.test(pag)) return 'javascript'
        if (/css/.test(pag) || pag === 'projeto-404') return 'css'
        if (PAGINAS_SEMPRE.has(pag)) return 'javascript'
        return 'php'
    }

    // window.editor PROVISÓRIO: O JS DO CARTÃO (ex.: projetos-paginas-sections-css/-js) RODA NO $(function(){...}) E JÁ CHAMA
    // editor.session.setOptions(...), juntaConteudos() USA editor.getSession().getValue() — NO LEGADO O index.php CRIAVA O
    // ACE ANTES. AQUI O ACE CARREGA DEPOIS (CHUNK SOB DEMANDA), ENTÃO ATÉ ELE FICAR PRONTO AS CHAMADAS CAEM NUMA SESSÃO
    // RESERVA (SEM "editor is not defined"); DEPOIS DISSO TUDO VAI PARA O EDITOR REAL
    let editorReal   = null
    let valorReserva = ''

    const sessaoReserva = {
        setOptions() {},
        setMode() {},
        setUseWorker() {},
        on() {},
        getValue: () => valorReserva,
        setValue: (texto) => { valorReserva = String(texto ?? '') },
        getLength: () => valorReserva.split('\n').length,
    }

    const editorGlobal = new Proxy({}, {
        get(_, prop) {
            if (editorReal) {
                const valor = editorReal[prop]
                return typeof valor === 'function' ? valor.bind(editorReal) : valor
            }
            if (prop === 'session') return sessaoReserva
            if (prop === 'getSession') return () => sessaoReserva
            return () => {}
        },
    })

    //O FormCodeEditor DO TxtConteudo VIRA O EDITOR REAL POR TRÁS DO window.editor (E SAI DELE AO DESMONTAR)
    export const definirEditorReal = (editor) => {
        editorReal = editor
    }

    export const soltarEditorReal = (editor) => {
        if (editorReal === editor) editorReal = null
    }

    //CHAMADO PELO FormContext (useLayoutEffect, ANTES DO <script> DO CARTÃO) QUANDO O FORMULÁRIO TEM CAMPO DE CÓDIGO
    export const instalarEditorGlobal = () => {
        if (window.editor && window.editor !== editorGlobal) return () => {}
        window.editor = editorGlobal
        return () => {
            editorReal = null
            valorReserva = ''
            limparGlobal('editor', editorGlobal)
        }
    }
