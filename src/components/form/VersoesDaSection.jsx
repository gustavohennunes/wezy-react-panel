    import { useMemo, useState } from 'react'
    import clsx from 'clsx'
    import { toast } from 'sonner'
    import { KeenIcon } from '@/components/keenicons'
    import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { diffDeLinhas, comContexto } from '@/utils/diffDeLinhas'
    import { criaMontadorLegado } from '@/components/legacy/criaMontadorLegado'
    import { Combobox } from './FormCombobox'

    // VERSÕES DO HTML, CSS E JS DA SECTION (?pag=projetos-paginas-sections). CADA ABA TEM A PRÓPRIA LINHA DO TEMPO
    // (includes/config.php: listaVersoesSection), SÓ COM AS VERSÕES EM QUE ELA MUDOU, E A PRIMEIRA É O QUE ESTÁ SALVO HOJE:
    // - HTML: ÁREA principal DO EDITOR "Conteúdo" (uso_livre). RESTAURA NO EDITOR; O SAVE CONTINUA O NORMAL DO FORMULÁRIO
    //   (QUE TAMBÉM REGERA O component_processed)
    // - CSS / JS: ABAS CSS E JS DA SECTION (sg_projetos_paginas_sections_css/_js). O EDITOR DELAS NÃO ESTÁ NESTA TELA, ENTÃO
    //   RESTAURAR GRAVA DIRETO (acao=versoes-restaurar NO CARTÃO)
    // - CSS/JS DO EDITOR: ÁREAS css/js DO uso_livre, SÓ QUANDO ALGUMA VERSÃO USA. RESTAURA NO EDITOR, COMO O HTML
    // O CARTÃO MARCA O LUGAR COM <div data-versoes-section="ID">

    const ABAS = [
        { chave: 'html', titulo: 'HTML', area: 'principal' },
        { chave: 'css', titulo: 'CSS' },
        { chave: 'js', titulo: 'JS' },
        { chave: 'css_editor', titulo: 'CSS do editor', area: 'css', opcional: true },
        { chave: 'js_editor', titulo: 'JS do editor', area: 'js', opcional: true },
    ]

    //CONTEÚDO DE UMA ÁREA NO EDITOR AGORA: A ÁREA ABERTA ESTÁ NO ACE (window.editor), AS OUTRAS NOS HIDDEN .conteudo-area
    const conteudoNoEditor = (area) => {
        if (document.querySelector('#elemento-atual')?.value === area && window.editor?.getSession) {
            return window.editor.getSession().getValue()
        }
        return document.querySelector(`.conteudo-area[data-area="${area}"]`)?.value ?? ''
    }

    const restauraNoEditor = (area, texto) => {
        const hidden = document.querySelector(`.conteudo-area[data-area="${area}"]`)
        if (hidden) {
            hidden.value = texto
            hidden.dispatchEvent(new Event('input', { bubbles: true }))
        }
        if (document.querySelector('#elemento-atual')?.value === area && window.editor?.getSession) {
            window.editor.getSession().setValue(texto)
        }
    }

    const urlDoCartao = (extras) => {
        const params = new URLSearchParams(window.location.search)
        Object.entries(extras).forEach(([chave, valor]) => params.set(chave, valor))
        return buildApiUrl(params)
    }

    //O CARTÃO RESPONDE COM exit(json_encode(...)): VEM CRU OU DENTRO DO ENVELOPE DA API
    const dadosDaResposta = (resposta) => resposta.data?.success?.response?.data ?? resposta.data

    const MARCA_DA_LINHA = { igual: ' ', removida: '-', adicionada: '+' }

    const ClasseDaLinha = {
        igual: 'text-gray-700',
        removida: 'bg-danger-light text-danger',
        adicionada: 'bg-success-light text-success',
    }

    const DiffView = ({ linhas, inteiro }) => {

        const visiveis = useMemo(() => (inteiro ? linhas : comContexto(linhas)), [linhas, inteiro])

        if (!linhas.some((linha) => linha.tipo !== 'igual')) {
            return <div className="px-4 py-10 text-center text-2sm text-gray-600">Sem diferenças.</div>
        }

        return (
            <table className="w-full border-collapse font-mono text-xs leading-5">
                <tbody>
                    {visiveis.map((linha, indice) =>
                        linha.tipo === 'oculto' ? (
                            <tr key={indice} className="bg-gray-100 text-gray-500">
                                <td colSpan={4} className="px-3 py-0.5 text-center">{`⋯ ${linha.quantidade} linha${linha.quantidade > 1 ? 's' : ''} sem alteração`}</td>
                            </tr>
                        ) : (
                            <tr key={indice} className={ClasseDaLinha[linha.tipo]}>
                                <td className="w-10 select-none border-e border-gray-200 px-1.5 text-end align-top text-gray-500">{linha.antes ?? ''}</td>
                                <td className="w-10 select-none border-e border-gray-200 px-1.5 text-end align-top text-gray-500">{linha.depois ?? ''}</td>
                                <td className="w-5 select-none px-1 text-center align-top">{MARCA_DA_LINHA[linha.tipo]}</td>
                                <td className="whitespace-pre-wrap break-all pe-3 align-top">{linha.texto || ' '}</td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        )

    }

    const VersoesDaSection = ({ elemento }) => {

        const idSection = elemento.getAttribute('data-versoes-section')

        const [aberto, setAberto]           = useState(false)
        const [carregando, setCarregando]   = useState(false)
        const [restaurando, setRestaurando] = useState(false)
        const [linhasDoTempo, setLinhasDoTempo] = useState(null)
        const [aba, setAba]                 = useState('html')
        const [selecionada, setSelecionada] = useState(0)
        const [comparar, setComparar]       = useState('anterior')
        const [inteiro, setInteiro]         = useState(false)
        //ÁREAS DO EDITOR LIDAS AO ABRIR (O EDITOR NÃO MUDA COM O MODAL ABERTO)
        const [noEditor, setNoEditor]       = useState({})
        const [confirm, confirmDialog]      = useConfirm()

        const carrega = async () => {
            setCarregando(true)
            try {
                const dados = dadosDaResposta(await api.get(urlDoCartao({ acao: 'versoes-conteudo', id: idSection })))
                setLinhasDoTempo(dados?.timelines && typeof dados.timelines === 'object' ? dados.timelines : {})
            } catch {
                setLinhasDoTempo(null)
                toast.error('Não foi possível carregar as versões.')
            } finally {
                setCarregando(false)
            }
        }

        //A VERSÃO SALVA HOJE COMPARADA COM ELA MESMA NÃO MOSTRAVA NADA: ELA ABRE COM "versão anterior" (O QUE O ÚLTIMO SAVE
        //MUDOU); AS ANTIGAS ABREM COM "atual" (O QUE MUDA SE RESTAURAR)
        const seleciona = (indice, lista) => {
            setSelecionada(indice)
            setComparar(lista?.[indice]?.current === false ? 'atual' : 'anterior')
        }

        const abre = () => {
            setAberto(true)
            seleciona(0)
            setNoEditor(Object.fromEntries(ABAS.filter((item) => item.area).map(({ chave, area }) => [chave, conteudoNoEditor(area)])))
            carrega()
        }

        //CSS/JS DO EDITOR SÓ APARECEM QUANDO ALGUMA VERSÃO TEM CONTEÚDO NELES
        const abasVisiveis = ABAS.filter((item) => !item.opcional || (linhasDoTempo?.[item.chave] || []).some((versao) => versao.content !== ''))
        const abaAtual     = ABAS.find((item) => item.chave === aba)
        const versoes      = linhasDoTempo?.[aba] || []
        const versao       = versoes[selecionada]
        const anterior     = versoes[selecionada + 1]
        const noEditorAba  = abaAtual?.area !== undefined

        //"atual": O QUE MUDA AO RESTAURAR ESTA VERSÃO (EDITOR, OU O SALVO HOJE NAS ABAS CSS/JS -> VERSÃO).
        //"anterior": O QUE ESTE SAVE MUDOU (VERSÃO ANTERIOR -> VERSÃO)
        const atual = noEditorAba ? noEditor[aba] ?? '' : versoes[0]?.content ?? ''
        const linhas = useMemo(() => {
            if (!versao) return []
            return diffDeLinhas(comparar === 'atual' ? atual : anterior?.content ?? '', versao.content ?? '')
        }, [versao, anterior, comparar, atual])

        const adicionadas = linhas.filter((linha) => linha.tipo === 'adicionada').length
        const removidas   = linhas.filter((linha) => linha.tipo === 'removida').length

        const trocaAba = (chave) => {
            setAba(chave)
            seleciona(0)
        }

        const restaura = async () => {

            if (noEditorAba) {
                restauraNoEditor(abaAtual.area, versao.content ?? '')
                setAberto(false)
                toast.success(`${abaAtual.titulo} da versão de ${versao.date || 'agora'} restaurado no editor. Salve a section para aplicar.`)
                return
            }

            //ABAS CSS/JS: GRAVA DIRETO. FECHA O MODAL ANTES PARA A CONFIRMAÇÃO NÃO DISPUTAR FOCO COM ELE
            setAberto(false)
            const confirmou = await confirm({
                title: `Restaurar o ${abaAtual.titulo}?`,
                description: `O ${abaAtual.titulo} da section volta para a versão de ${versao.date} e é salvo agora. O conteúdo atual continua guardado nas versões.`,
                confirmText: 'Restaurar',
                cancelText: 'Cancelar',
                confirmClass: 'btn-primary',
            })
            if (!confirmou) {
                setAberto(true)
                return
            }

            setRestaurando(true)
            try {
                const dados = dadosDaResposta(await api.post(urlDoCartao({ acao: 'versoes-restaurar', id: idSection, timeline: aba, versao: versao.id }), {}))
                if (dados?.status !== true) throw new Error(dados?.message)
                toast.success(dados.message || `${abaAtual.titulo} restaurado.`)
            } catch (erro) {
                toast.error(erro?.message || `Não foi possível restaurar o ${abaAtual.titulo}.`)
            } finally {
                setRestaurando(false)
            }

        }

        const descricaoDaVersao = (item) => {
            if (item.current) return item.date ? `Salva atualmente (desde ${item.date})` : 'Salva atualmente'
            return item.date
        }

        return (
            <>
                <button type="button" className="btn btn-sm btn-light gap-1.5" onClick={abre} disabled={restaurando}>
                    <KeenIcon icon="time" className="text-sm" />
                    Ver versões do HTML, CSS e JS
                </button>

                <Dialog open={aberto} onOpenChange={setAberto}>
                    <DialogContent className="flex max-h-[90vh] w-[calc(100vw-32px)] max-w-6xl flex-col p-0">

                        <DialogHeader className="px-5">
                            <DialogTitle>Versões do HTML, CSS e JS</DialogTitle>
                            <DialogDescription className="sr-only">Versões salvas do HTML, CSS e JS da section, com comparação</DialogDescription>
                        </DialogHeader>

                        <DialogBody className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5">

                            {carregando && <div className="w-full py-10 text-center text-2sm text-gray-600">Carregando versões…</div>}

                            {!carregando && linhasDoTempo && (
                                <>
                                    <div className="flex flex-wrap gap-1" role="tablist">
                                        {abasVisiveis.map(({ chave, titulo }) => (
                                            <button
                                                key={chave}
                                                type="button"
                                                role="tab"
                                                aria-selected={aba === chave}
                                                onClick={() => trocaAba(chave)}
                                                className={clsx('btn btn-sm gap-1.5', aba === chave ? 'btn-primary' : 'btn-light')}
                                            >
                                                {titulo}
                                                <span className="text-xs opacity-75">{(linhasDoTempo[chave] || []).length}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {versao && (
                                        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">

                                            {/* VERSÕES DA ABA: A MAIS NOVA EM CIMA (= O QUE ESTÁ SALVO HOJE) */}
                                            <ul className="flex max-h-48 shrink-0 flex-col gap-1 overflow-y-auto md:max-h-none md:w-60">
                                                {versoes.map((item, indice) => (
                                                    <li key={item.id + indice}>
                                                        <button
                                                            type="button"
                                                            onClick={() => seleciona(indice, versoes)}
                                                            className={clsx(
                                                                'flex w-full flex-col items-start rounded-md border px-3 py-2 text-start',
                                                                indice === selecionada ? 'border-primary bg-primary-light' : 'border-gray-200 hover:bg-gray-100'
                                                            )}
                                                        >
                                                            <span className={clsx('text-2sm font-semibold', indice === selecionada ? 'text-primary' : 'text-gray-900')}>
                                                                {descricaoDaVersao(item)}
                                                            </span>
                                                            {item.user && <span className="text-xs text-gray-600">{item.user}</span>}
                                                        </button>
                                                    </li>
                                                ))}
                                                {versoes.length === 1 && (
                                                    <li className="px-1 pt-1 text-xs text-gray-600">Nenhuma versão anterior ainda. A cada save, a versão nova aparece aqui.</li>
                                                )}
                                            </ul>

                                            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* MESMO COMBOBOX DOS FORMULÁRIOS NO LUGAR DO <select> NATIVO */}
                                                    <div className="w-72 max-w-full">
                                                        <Combobox
                                                            ariaLabel="Comparar com"
                                                            value={comparar}
                                                            onChange={setComparar}
                                                            options={[
                                                                { value: 'atual', label: noEditorAba ? 'Comparar com o editor atual' : 'Comparar com o salvo atualmente' },
                                                                { value: 'anterior', label: 'Comparar com a versão anterior' },
                                                            ]}
                                                        />
                                                    </div>

                                                    <label className="flex items-center gap-1.5 text-2sm text-gray-700">
                                                        <input type="checkbox" className="checkbox checkbox-sm" checked={inteiro} onChange={(e) => setInteiro(e.target.checked)} />
                                                        Arquivo inteiro
                                                    </label>

                                                    <span className="ms-auto flex items-center gap-3 text-xs">
                                                        <span className="font-semibold text-success">+{adicionadas}</span>
                                                        <span className="font-semibold text-danger">−{removidas}</span>
                                                    </span>
                                                </div>

                                                <span className="text-xs text-gray-600">
                                                    {comparar === 'atual'
                                                        ? 'Verde: entra ao restaurar esta versão. Vermelho: sai.'
                                                        : anterior ? `Mudanças desde a versão de ${anterior.date}.` : 'Versão mais antiga guardada.'}
                                                </span>

                                                <div className="min-h-[240px] flex-1 overflow-auto rounded-md border border-gray-200">
                                                    <DiffView linhas={linhas} inteiro={inteiro} />
                                                </div>

                                            </div>

                                        </div>
                                    )}
                                </>
                            )}

                        </DialogBody>

                        {!carregando && versao && (
                            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 px-5">
                                <span className="text-xs text-gray-600">
                                    {noEditorAba ? 'Restaurar coloca a versão no editor; salve a section para aplicar.' : `Restaurar salva o ${abaAtual.titulo} da section na hora.`}
                                </span>
                                <div className="flex gap-2">
                                    <button type="button" className="btn btn-light" onClick={() => setAberto(false)}>Fechar</button>
                                    <button type="button" className="btn btn-primary" onClick={restaura} disabled={restaurando || atual === (versao.content ?? '')}>
                                        {`Restaurar ${abaAtual.titulo} desta versão`}
                                    </button>
                                </div>
                            </DialogFooter>
                        )}

                    </DialogContent>
                </Dialog>

                {confirmDialog}
            </>
        )

    }

    const LegacyVersoesDaSection = criaMontadorLegado({
        seletor: '[data-versoes-section]',
        marcador: 'data-legacy-versoes',
        Componente: VersoesDaSection,
        substituir: true,
    })

    export { LegacyVersoesDaSection }
