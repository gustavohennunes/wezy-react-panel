    import { useEffect } from 'react'
    import { api } from '@/services/api'
    import { toast } from 'sonner'
    import qs from 'qs'
    import { injectLegacyIconsCss } from '@/utils/legacyIcons'
    import { limparGlobal } from '@/utils/limparGlobal'
    import { recarregarSeVersaoNova } from '@/utils/versaoNova'
    import './legacy-compat.css'

    //REESCREVE LINKS LEGADOS (index.php?pag=...) PARA AS ROTAS DO SPA
    const rewriteLegacyLinks = (root) => {

        root.querySelectorAll('a[href^="index.php"]').forEach((a) => {
            a.setAttribute('href', a.getAttribute('href').replace(/^index\.php/, '/'))
        })

    }

    // ENHANCER DOS CARDS DE CÓDIGO DO PAINEL LEGADO (ex.: ?pag=modulos).
    //
    // O CARD ENTREGA VIA CAMPO `aut` UM <textarea id="TxtConteudo"> + HIDDENS
    // .conteudo-area (principal/ajax/funcoes/css/js/instalador) + BOTÕES DE ABA.
    // NO PAINEL ANTIGO, O index.php INJETAVA O ACE E O PRÓPRIO CARD TRAZIA UM
    // <script> COM AS FUNÇÕES (setConteudoEditor, juntaConteudos, salvarModulo...)
    // — QUE A API DESCARTA. ESTE HOOK REPRODUZ ESSE COMPORTAMENTO NO REACT.
    const useLegacyCodeEditor = (data) => {

        useEffect(() => {

            let editor    = null
            let destroyed = false
            let iniciado  = false
            const cleanups = []

            //O FORMULÁRIO RENDERIZA EM UM SEGUNDO CICLO (sections via useEffect no FormContext),
            //ENTÃO O #TxtConteudo PODE AINDA NÃO EXISTIR — AGUARDA ATÉ ~5s ANTES DE DESISTIR
            const aguardaTextarea = setInterval(() => {

                const textarea = document.getElementById('TxtConteudo')

                if (textarea && !iniciado) {
                    iniciado = true
                    clearInterval(aguardaTextarea)
                    setup(textarea)
                }

            }, 150)

            const desisteTimeout = setTimeout(() => clearInterval(aguardaTextarea), 5000)

            cleanups.push(() => {
                clearInterval(aguardaTextarea)
                clearTimeout(desisteTimeout)
            })

            function setup(textarea){

            const areaInput = (area) =>
                document.querySelector(`.conteudo-area[data-area="${area}"]`)

            const currentArea = () =>
                document.getElementById('elemento-atual')?.value || 'principal'

            //GRAVA O CONTEÚDO DO EDITOR NO HIDDEN DA ABA ATIVA (chamado antes de trocar de aba e no submit)
            const juntaConteudos = () => {
                if (!editor) return
                const input = areaInput(currentArea())
                if (input) input.value = editor.getSession().getValue()
            }

            const setConteudoEditor = (area) => {

                if (!editor) return

                juntaConteudos()

                editor.getSession().setValue(areaInput(area)?.value || '')

                const atual = document.getElementById('elemento-atual')
                if (atual) atual.value = area

                document.querySelectorAll('.btt-novo-cinza').forEach((btn) => {
                    btn.classList.toggle('btt-ativo', btn.dataset.botao === area)
                })

            }

            //TELA CHEIA — USA A CLASSE .openEditor (mesmo nome do <style> do CARD legado)
            const abreEditor = () => {

                const el = editor?.container || document.querySelector('.ace_editor')
                if (!el) return

                el.classList.add('openEditor')

                if (!document.querySelector('.btt-fechar-editor')) {

                    const fechar = document.createElement('a')
                    fechar.className = 'btt-fechar-editor btn btn-sm btn-light'
                    fechar.textContent = 'Fechar'
                    Object.assign(fechar.style, {
                        position: 'fixed', top: '8px', right: '8px', zIndex: '10000', cursor: 'pointer',
                    })
                    fechar.onclick = fechaEditor
                    document.body.appendChild(fechar)

                }

                editor?.resize(true)

            }

            const fechaEditor = () => {

                const el = editor?.container || document.querySelector('.ace_editor')
                el?.classList.remove('openEditor')

                document.querySelector('.btt-fechar-editor')?.remove()

                editor?.resize(true)

            }

            const usarCodigoInicial = (seletor) => {

                if (!editor) return

                if (editor.getSession().getValue().length < 10) {
                    const hidden = document.querySelector(seletor)
                    if (hidden) editor.getSession().setValue(atob(hidden.value))
                }

            }

            //CTRL+S — MESMO ENDPOINT DO PAINEL ANTIGO (modules/save com request-token do card).
            //UM Ctrl+S CHEGA AQUI POR DOIS CAMINHOS: O keydown DESTE HOOK E O document.onkeydown DO PRÓPRIO CARTÃO (QUE
            //CHAMA window.salvarModulo, ESTA MESMA FUNÇÃO) — SALVAVA 2x E GRAVAVA 2 VERSÕES. COM UM ENVIO EM ANDAMENTO OU
            //ACABADO DE COMEÇAR, A SEGUNDA CHAMADA É IGNORADA
            let salvando = false
            let ultimoEnvio = 0
            const salvarModulo = async () => {

                if (salvando || Date.now() - ultimoEnvio < 800) return
                salvando = true
                ultimoEnvio = Date.now()

                juntaConteudos()

                const conteudo = ['principal', 'ajax', 'funcoes', 'css', 'js', 'instalador'].map(
                    (area) => areaInput(area)?.value || ''
                )

                conteudo.push(document.querySelector('#CkbBackend_automatico:checked')?.value || '')

                const usarModulo = new URLSearchParams(window.location.search).get('id')

                try {

                    const response = await api.post(
                        '/modules/save',
                        qs.stringify({
                            usarModulo,
                            conteudo,
                            'request-token': '8f16f54b-3e05-4803-ab53-e75fc4f7df85',
                        }),
                        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    )

                    const partes = String(response.data).split('|')

                    if (partes[1] === 'ok') {
                        toast.success(partes[2] || 'Módulo salvo com sucesso!')
                    } else {
                        toast.error('Não foi possível salvar este módulo. Tente novamente.')
                    }

                } catch {
                    toast.error('Não foi possível salvar este módulo. Tente novamente.')
                } finally {
                    salvando = false
                }

            }

            //OS BOTÕES DO CARD USAM href="Javascript:funcao();" — PRECISAM EXISTIR NO window
            window.setConteudoEditor            = setConteudoEditor
            window.juntaConteudos               = juntaConteudos
            window.abreEditor                   = abreEditor
            window.fechaEditor                  = fechaEditor
            window.codigoInicial                = () => usarCodigoInicial('.usar-codigo-inicial')
            window.codigoInicialSemComentarios  = () => usarCodigoInicial('.usar-codigo-inicial-sem-comentario')
            //O salvarModulo/Ctrl+S DAQUI GRAVA EM modules/save (CARTÃO modulos). OUTROS CARTÕES COM #TxtConteudo (ex.: ABA Geral
            //DA SECTION) TÊM O PRÓPRIO SALVAMENTO — ANTES ESTE Ctrl+S TAMBÉM DISPARAVA LÁ E TENTAVA SALVAR O id DA SECTION COMO
            //MÓDULO ("O modulo atual nao foi encontrado para criar a copia de recuperacao")
            const noCartaoModulos = new URLSearchParams(window.location.search).get('pag') === 'modulos'
            if (noCartaoModulos) {
                window.salvarModulo = salvarModulo
                //SÓ TIRA SE AINDA FOR A DAQUI: NOS OUTROS CARTÕES O salvarModulo É DO PRÓPRIO CARTÃO
                cleanups.push(() => limparGlobal('salvarModulo', salvarModulo))
            }

            //AJUSTES NO HTML LEGADO DO CARD: sprite de ícones + links index.php → SPA + select cru
            injectLegacyIconsCss()

            const formRoot = textarea.closest('form') || document
            rewriteLegacyLinks(formRoot)
            formRoot.querySelectorAll('select:not([class*="select"])').forEach((sel) => {
                sel.classList.add('legacy-select')
            })

            //CARREGA O ACE SOB DEMANDA (chunk separado) E INICIALIZA COMO O index.php LEGADO
            ;(async () => {

                try {

                    const valorInicial = areaInput('principal')?.value || textarea.value || ''

                    console.info('[LegacyCodeEditor] iniciando — bytes da área principal:', valorInicial.length)

                    //O ace PRIMEIRO (MODO E TEMA SE REGISTRAM NO window.ace), DEPOIS OS DOIS JUNTOS
                    const aceModule = await import('ace-builds/src-noconflict/ace')
                    //ext-searchbox: CAIXA DO CTRL+F/CTRL+H. SEM ELA O ACE TENTA BAIXAR ext-searchbox.js PELO basePath (NÃO EXISTE
                    //NO BUILD) E RECEBE O index.html ("Unexpected token '<'" E "reading 'Search'")
                    await Promise.all([import('ace-builds/src-noconflict/mode-php'), import('ace-builds/src-noconflict/theme-idle_fingers'), import('ace-builds/src-noconflict/ext-searchbox')])

                    if (destroyed) return

                    const ace = window.ace || aceModule.default || aceModule

                    //PADRÃO CANÔNICO DO ACE: UMA <div> HOST JÁ DIMENSIONADA ANTES DO init.
                    //(ace.edit direto no textarea o substitui por um <pre> sem tamanho e
                    //depende de medições de layout que falham durante a montagem do React)
                    const host = document.createElement('div')
                    host.style.width    = '100%'
                    host.style.height   = '950px'
                    host.style.fontSize = '13px'

                    textarea.style.display = 'none'
                    textarea.parentNode.insertBefore(host, textarea)

                    //ESPERA DOIS FRAMES PARA O HOST TER LAYOUT CALCULADO
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

                    if (destroyed) {
                        host.remove()
                        return
                    }

                    editor = ace.edit(host)
                    editor.setTheme('ace/theme/idle_fingers')
                    editor.getSession().setMode('ace/mode/php')
                    editor.getSession().setUseWorker(false)
                    editor.getSession().setValue(valorInicial, -1)
                    editor.resize(true)

                    //REMEDIÇÃO APÓS FONTES/CSS ASSENTAREM
                    const remedicao = setTimeout(() => {
                        if (!destroyed && editor) {
                            editor.resize(true)
                            editor.renderer.updateFull(true)
                        }
                    }, 400)
                    cleanups.push(() => clearTimeout(remedicao))

                    console.info('[LegacyCodeEditor] ACE pronto — linhas:', editor.getSession().getLength())

                    window.editor = editor

                } catch (err) {
                    //ABA COM BUILD ANTERIOR: O CHUNK DO ace NÃO EXISTE MAIS — RECARREGA COM A VERSÃO NOVA
                    if (recarregarSeVersaoNova(err)) return
                    console.error('[LegacyCodeEditor] Falha ao iniciar o editor ACE:', err)
                    toast.error('Não foi possível carregar o editor de código. Veja o console.')
                }

            })()

            //NO SUBMIT DO FORMULÁRIO, DESPEJA O EDITOR NO HIDDEN DA ABA ATIVA
            const form = textarea.closest('form')
            if (form) {
                form.addEventListener('submit', juntaConteudos)
                cleanups.push(() => form.removeEventListener('submit', juntaConteudos))
            }

            //CTRL+S / CMD+S (SÓ NO CARTÃO modulos — VER noCartaoModulos)
            const onKeyDown = (e) => {
                if (noCartaoModulos && (e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') {
                    e.preventDefault()
                    salvarModulo()
                }
            }
            document.addEventListener('keydown', onKeyDown)
            cleanups.push(() => document.removeEventListener('keydown', onKeyDown))

            //SELETOR DE ÍCONES DO MÓDULO (.lista-icones → FrmIconeX/FrmIconeY)
            const onIconClick = (e) => {

                const item = e.target.closest('.lista-icones')
                if (!item) return

                document.querySelectorAll('.lista-icones').forEach((el) => {
                    el.classList.remove('icone-ativo')
                    el.style.opacity = '0.4'
                })

                item.classList.add('icone-ativo')
                item.style.opacity = '1'

                const icone = item.querySelector('.icone-item')
                const setX = document.getElementById('FrmIconeX')
                const setY = document.getElementById('FrmIconeY')
                if (icone && setX && setY) {
                    setX.value = icone.dataset.x
                    setY.value = icone.dataset.y
                }

            }
            document.addEventListener('click', onIconClick)
            cleanups.push(() => document.removeEventListener('click', onIconClick))

            //TIPO DO MÓDULO (radios .tipo-do-modulo) → MOSTRA/ESCONDE tr-modulo-padrao / tr-modulo-padrao-token
            const arrumaSelect = () => {

                const valor = document.querySelector('.tipo-do-modulo:checked')?.value

                const toggle = (seletor, mostrar) => {
                    document.querySelectorAll(seletor).forEach((el) => {
                        const linha = el.closest('[class*="tr-modulo"]') || el
                        linha.style.display = mostrar ? '' : 'none'
                    })
                }

                toggle('.tr-modulo-padrao', valor === '2')
                toggle('.tr-modulo-padrao-token', valor === '3')

            }

            const onTipoChange = (e) => {
                if (e.target.closest('.tipo-do-modulo')) arrumaSelect()
            }
            document.addEventListener('change', onTipoChange)
            document.addEventListener('click', onTipoChange)
            cleanups.push(() => {
                document.removeEventListener('change', onTipoChange)
                document.removeEventListener('click', onTipoChange)
            })

            arrumaSelect()

            }

            return () => {

                destroyed = true
                cleanups.forEach((fn) => fn())
                document.querySelector('.btt-fechar-editor')?.remove()

                if (editor) {
                    const container = editor.container
                    editor.destroy()
                    container?.remove()
                }

                //VER limparGlobal: delete DIRETO QUEBRAVA QUANDO O <script> DO CARTÃO DECLARAVA A MESMA FUNÇÃO NO GLOBAL
                ;['setConteudoEditor', 'juntaConteudos', 'abreEditor', 'fechaEditor', 'codigoInicial', 'codigoInicialSemComentarios']
                    .forEach((nome) => limparGlobal(nome))
                if (editor) limparGlobal('editor', editor)

            }

        }, [data])

    }

    export { useLegacyCodeEditor }
