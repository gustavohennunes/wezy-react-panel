    import { useEffect, useRef } from 'react'
    import { toast } from 'sonner'
    import { limparGlobal } from '@/utils/limparGlobal'
    import { HIDDEN_DO_CARTAO, modoDoEditor, definirEditorReal, soltarEditorReal } from './editorGlobal'
    import { recarregarSeVersaoNova } from '@/utils/versaoNova'

    // EDITOR DE CÓDIGO (ACE) PARA CAMPOS Txt QUE O index.php LEGADO TRANSFORMAVA EM EDITOR (index.php:573-610:
    // #TxtConteudo, #TxtConteudoFinal E #TxtConteudo_json NAS PÁGINAS DE $modulosHabilitados/$modulosHabilitadosAcao).
    // NO REACT ESSES CAMPOS VINHAM COMO <textarea> COMUM. O VALOR VAI NO <input type="hidden"> COM O NOME DO CAMPO E,
    // NO TxtConteudo, TAMBÉM EM HdnConteudo — O JS DO CARTÃO (QUE A API NÃO MANDA) COPIAVA O EDITOR PARA ESSE HIDDEN
    // ANTES DO ENVIO, E O forms() DE CARTÕES COMO projetos-paginas-sections-css/-js LÊ $_POST['HdnConteudo']

    //IMPORT FIXO POR LINGUAGEM: O VITE NÃO RESOLVE import() COM VARIÁVEL EM PACOTE DO node_modules
    const CARREGAR_MODO = {
        css: () => import('ace-builds/src-noconflict/mode-css'),
        javascript: () => import('ace-builds/src-noconflict/mode-javascript'),
        json: () => import('ace-builds/src-noconflict/mode-json'),
        php: () => import('ace-builds/src-noconflict/mode-php'),
    }

    const FormCodeEditor = ({ fieldName, value, onChange }) => {

        const hostRef   = useRef(null)
        const editorRef = useRef(null)
        const hiddenRef = useRef(null)
        const hdnRef    = useRef(null)

        //O VALOR INICIAL ENTRA UMA VEZ; DEPOIS O EDITOR É A FONTE (onChange SÓ ATUALIZA O ESTADO DO FORMULÁRIO)
        const valorInicial = useRef(value || '')

        useEffect(() => {

            let destruido  = false
            let observador = null
            let remedicao  = null

            ;(async () => {

                try {

                    const modo = modoDoEditor(fieldName)

                    //O ace PRIMEIRO (TEMA E MODO SE REGISTRAM NO window.ace), DEPOIS OS DOIS JUNTOS
                    const aceModule = await import('ace-builds/src-noconflict/ace')
                    //ext-searchbox: CAIXA DO CTRL+F/CTRL+H (SEM ELA O ACE BUSCA ext-searchbox.js PELO basePath E QUEBRA)
                    await Promise.all([import('ace-builds/src-noconflict/theme-idle_fingers'), import('ace-builds/src-noconflict/ext-searchbox'), CARREGAR_MODO[modo]()])

                    if (destruido || !hostRef.current) return

                    const ace    = window.ace || aceModule.default || aceModule
                    const editor = ace.edit(hostRef.current)

                    editor.setTheme('ace/theme/idle_fingers')
                    editor.session.setOptions({ mode: `ace/mode/${modo}`, tabSize: 4, useSoftTabs: true })
                    editor.session.setUseWorker(false)
                    editor.session.setValue(valorInicial.current, -1)
                    if (hiddenRef.current) hiddenRef.current.value = valorInicial.current
                    if (hdnRef.current) hdnRef.current.value = valorInicial.current

                    editor.session.on('change', () => {
                        const atual = editor.session.getValue()
                        if (hiddenRef.current) hiddenRef.current.value = atual
                        if (hdnRef.current) hdnRef.current.value = atual
                        onChange?.(atual)
                    })

                    editorRef.current = editor
                    if (fieldName === 'TxtConteudo') definirEditorReal(editor)
                    remedicao = setTimeout(() => !destruido && editor.resize(true), 300)

                    //EDITOR QUE NASCE ESCONDIDO (ABA DE CATEGORIA FECHADA) FICA SEM TAMANHO: AO APARECER, REMEDE
                    if (typeof ResizeObserver !== 'undefined') {
                        observador = new ResizeObserver(() => !destruido && editor.resize(true))
                        observador.observe(hostRef.current)
                    }

                    //"Adicionar @media Tablet | Mobile" DO CARTÃO (aut COM href="Javascript:addMediaTablet();" E OS HIDDENS
                    //#mediaTablet/#mediaMobile EM BASE64). AS FUNÇÕES VINHAM NO <script> DO CARTÃO, QUE A API NÃO MANDA:
                    //ACRESCENTAM O BLOCO NO FIM DO EDITOR E POSICIONAM O CURSOR DENTRO DELE
                    if (fieldName === 'TxtConteudo') {

                        const adicionarMedia = (idHidden) => {
                            const hidden = document.getElementById(idHidden)
                            if (!hidden?.value) return
                            let bloco = ''
                            try {
                                bloco = atob(hidden.value)
                            } catch {
                                return
                            }
                            editor.session.insert({ row: editor.session.getLength(), column: 0 }, bloco)
                            const ultima = editor.session.getLength() - 2
                            editor.gotoLine(ultima + 1, editor.session.getLine(ultima).length, true)
                            editor.focus()
                        }

                        window.addMediaTablet = () => adicionarMedia('mediaTablet')
                        window.addMediaMobile = () => adicionarMedia('mediaMobile')

                    }

                } catch (erro) {
                    //ABA COM BUILD ANTERIOR: O CHUNK DO ace NÃO EXISTE MAIS — RECARREGA COM A VERSÃO NOVA
                    if (recarregarSeVersaoNova(erro)) return
                    console.error('[FormCodeEditor] Falha ao iniciar o editor:', erro)
                    toast.error('Não foi possível carregar o editor de código.')
                }

            })()

            return () => {
                destruido = true
                clearTimeout(remedicao)
                observador?.disconnect()
                if (fieldName === 'TxtConteudo') {
                    limparGlobal('addMediaTablet')
                    limparGlobal('addMediaMobile')
                }
                soltarEditorReal(editorRef.current)
                editorRef.current?.destroy()
                editorRef.current = null
            }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [fieldName])

        //O FormSection PREENCHE O ESTADO NUM useEffect (O EDITOR PODE NASCER COM VAZIO) E RECARREGA APÓS SALVAR: VALOR
        //VINDO DE FORA DO EDITOR ENTRA NELE. O QUE O PRÓPRIO EDITOR MANDOU VOLTA IGUAL E NÃO MEXE NO CURSOR
        useEffect(() => {
            const texto = value || ''
            valorInicial.current = texto
            if (hiddenRef.current) hiddenRef.current.value = texto
            if (hdnRef.current) hdnRef.current.value = texto
            const editor = editorRef.current
            if (editor && editor.session.getValue() !== texto) {
                editor.session.setValue(texto, -1)
            }
        }, [value])

        return (
            <div className="w-full">
                <div
                    ref={hostRef}
                    className="w-full overflow-hidden rounded-md border border-gray-300"
                    style={{ height: 950, fontSize: 13 }}
                />
                <input ref={hiddenRef} type="hidden" name={fieldName} defaultValue={valorInicial.current} />
                {HIDDEN_DO_CARTAO[fieldName] && (
                    <input ref={hdnRef} type="hidden" name={HIDDEN_DO_CARTAO[fieldName]} defaultValue={valorInicial.current} />
                )}
            </div>
        )

    }

    export { FormCodeEditor }
