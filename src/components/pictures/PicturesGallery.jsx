    import { useRef, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { toast } from 'sonner'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { cleanUrl } from '@/utils/urlHelper'
    import { carregarGaleria, salvarOrdemDasFotos, excluirFotos, mensagemErro } from './galeriaApi'
    import { EnvioDeFotos } from './EnvioDeFotos'
    import { GradeDeFotos } from './GradeDeFotos'

    // GALERIA DE FOTOS DOS CARTÕES (framework/fotos.php NO LEGADO: ?acao=Fotos E CARTÕES SÓ DE FOTOS). A API MANDA AS
    // FOTOS EM params.photos (PanelModule::buildPhotosData) E AS AÇÕES USAM AS MESMAS ROTAS DO LEGADO (VER galeriaApi)

    const SEM_FOTOS = { items: [] }

    //SELEÇÃO DAS FOTOS PARA EXCLUIR. SHIFT+CLIQUE MARCA/DESMARCA TODAS AS FOTOS ENTRE A ÚLTIMA CLICADA E ESTA (PARA FRENTE
    //OU PARA TRÁS), COMO NAS LISTAGENS (DataGridRowSelect). OUTRA RESPOSTA DA PONTE (data) DESMARCA TUDO
    const useSelecaoDeFotos = (fotos, data) => {

        const [marcadas, setMarcadas] = useState(() => new Set())
        const ultimaMarcada           = useRef(null)

        const [dataAnterior, setDataAnterior] = useState(data)
        if (data !== dataAnterior) {
            setDataAnterior(data)
            setMarcadas(new Set())
        }

        //O INTERVALO É CALCULADO AQUI E NÃO DENTRO DO setMarcadas(fn): O REACT PODE RODAR
        //O UPDATER SÓ NO PRÓXIMO RENDER, QUANDO ultimaMarcada JÁ APONTA PARA ESTA FOTO — E O INTERVALO VIRAVA SÓ ELA
        const marcar = (id, ligar, comShift) => {

            const anterior = ultimaMarcada.current
            ultimaMarcada.current = id

            const de  = comShift && anterior !== null ? fotos.findIndex((foto) => foto.id === anterior) : -1
            const ate = fotos.findIndex((foto) => foto.id === id)

            const ids = de !== -1 && ate !== -1
                ? fotos.slice(Math.min(de, ate), Math.max(de, ate) + 1).map((foto) => foto.id)
                : [id]

            setMarcadas((atual) => {
                const proxima = new Set(atual)
                ids.forEach((cada) => (ligar ? proxima.add(cada) : proxima.delete(cada)))
                return proxima
            })

        }

        const todasMarcadas = fotos.length > 0 && marcadas.size === fotos.length
        const alternarTodas = () => setMarcadas(todasMarcadas ? new Set() : new Set(fotos.map((foto) => foto.id)))
        const desmarcarTodas = () => setMarcadas(new Set())

        return { marcadas, marcar, todasMarcadas, alternarTodas, desmarcarTodas }

    }

    const RodapeDaGaleria = ({ selecionadas, todasMarcadas, onExcluir, onAlternarTodas }) => (
        <div className="card-footer flex flex-wrap items-center justify-between gap-3 py-3">
            <button
                type="button"
                className={clsx('btn btn-sm btn-danger transition-opacity', selecionadas === 0 && 'opacity-40 cursor-not-allowed')}
                disabled={selecionadas === 0}
                onClick={onExcluir}
            >
                <KeenIcon icon="trash" className="!text-sm" />
                Excluir selecionadas{selecionadas > 0 ? ` (${selecionadas})` : ''}
            </button>
            <button type="button" className="text-2sm font-medium text-primary hover:underline" onClick={onAlternarTodas}>
                {todasMarcadas ? 'Desmarcar todas' : 'Selecionar todas'}
            </button>
        </div>
    )

    const PicturesGallery = ({ data = SEM_FOTOS }) => {

        const navigate = useNavigate()
        const [confirm, confirmDialog] = useConfirm()

        const [fotos, setFotos] = useState(data?.items || [])
        const { marcadas, marcar, todasMarcadas, alternarTodas, desmarcarTodas } = useSelecaoDeFotos(fotos, data)

        //NOVA RESPOSTA DA PONTE: TROCA AS FOTOS DURANTE O RENDER (COM useEffect O PRIMEIRO RENDER MOSTRAVA AS ANTERIORES)
        const [dataAnterior, setDataAnterior] = useState(data)
        if (data !== dataAnterior) {
            setDataAnterior(data)
            setFotos(data?.items || [])
        }

        //SEM LIMITE DE FOTOS: O $qnt DO CARTÃO NÃO LIMITA NADA NO fotos.php (A CHECAGEM COMPARA mnr() DE UMA CONSULTA COM LIMIT 1,
        //ENTÃO NUNCA BARRA O ENVIO) — SÓ DEFINIA QUANTAS VAGAS VAZIAS A GRADE ANTIGA MOSTRAVA

        const recarregar = async () => {
            try {
                const galeria = await carregarGaleria()
                if (galeria) {
                    setFotos(galeria.items || [])
                    desmarcarTodas()
                }
            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message)
            }
        }

        //ENVIO COM A GALERIA NA RESPOSTA: ELA JÁ É A LISTA NOVA; SEM ELA, BUSCA DE NOVO
        const aoEnviar = (galeria) => (galeria ? setFotos(galeria.items || []) : recarregar())

        //A ORDEM MUDA NA HORA; SE O SERVIDOR RECUSAR, VOLTA
        const reordenar = async (nova) => {
            const anterior = fotos
            setFotos(nova)
            try {
                await salvarOrdemDasFotos(nova.map((foto) => foto.id))
            } catch (error) {
                setFotos(anterior)
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível salvar a nova ordem.')
            }
        }

        const excluir = async () => {

            if (marcadas.size === 0) return

            const ok = await confirm({
                title: marcadas.size === 1 ? 'Excluir foto?' : `Excluir ${marcadas.size} fotos?`,
                description: 'As fotos selecionadas serão apagadas. Essa ação não pode ser desfeita.',
            })
            if (!ok) return

            try {
                const resultado = await excluirFotos(Array.from(marcadas))
                if (resultado === 'ok') toast.success(marcadas.size === 1 ? 'Foto excluída.' : 'Fotos excluídas.')
                if (resultado === 'erro') mensagemErro('Algumas fotos não foram excluídas. Tente novamente.')
            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível excluir as fotos.')
            }

            await recarregar()

        }

        const voltar = () => {
            const destino = cleanUrl(data.back)
            navigate(destino.startsWith('?') ? '/' + destino : destino)
        }

        return (
            <div className="grid gap-5">

                {confirmDialog}

                <EnvioDeFotos data={data} onEnviado={aoEnviar} />

                <div className="card">

                    <div className="card-header min-h-0 py-3.5 flex-wrap gap-2">
                        <h3 className="card-title text-sm">
                            Fotos
                            <span className="ms-1.5 font-normal text-gray-500">({fotos.length})</span>
                        </h3>
                        {fotos.length > 1 && (
                            <span className="text-2xs text-gray-500">Arraste para mudar a ordem</span>
                        )}
                    </div>

                    <div className="card-body">
                        {fotos.length === 0 ? (
                            <p className="py-10 text-center text-2sm text-gray-500">Nenhuma foto enviada ainda.</p>
                        ) : (
                            <GradeDeFotos fotos={fotos} marcadas={marcadas} onMarcar={marcar} onReordenar={reordenar} />
                        )}
                    </div>

                    {fotos.length > 0 && (
                        <RodapeDaGaleria
                            selecionadas={marcadas.size}
                            todasMarcadas={todasMarcadas}
                            onExcluir={excluir}
                            onAlternarTodas={alternarTodas}
                        />
                    )}

                </div>

                {data?.back && (
                    <div className="flex justify-center">
                        <button type="button" onClick={voltar} className="btn btn-sm btn-light text-sm gap-1.5">
                            <KeenIcon icon="arrow-left" className="text-base" />
                            Voltar
                        </button>
                    </div>
                )}

            </div>
        )

    }

    export { PicturesGallery }
