    import { useEffect, useState } from 'react'
    import { useLocation, useNavigate } from 'react-router-dom'
    import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
    import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
    import { DatePicker } from '@mui/x-date-pickers/DatePicker'
    import dayjs from 'dayjs'
    import customParseFormat from 'dayjs/plugin/customParseFormat'
    import { KeenIcon } from '@/components/keenicons'
    import { Combobox } from '@/components/form/FormCombobox'
    import { utf8ParaBase64 } from '@/utils/base64'

    dayjs.extend(customParseFormat)

    // FILTROS DO CABEÇALHO DA LISTAGEM DEFINIDOS EM ARRAY NO CARTÃO ($formCabecalho). A API (class/HeaderFilters.php) MANDA
    // OS CAMPOS EM extra_content.header_form JÁ COM OS VALORES ATUAIS E AS OPÇÕES DOS SELECTS. AO FILTRAR, OS VALORES VÃO
    // PARA A URL EM &parametro= (base64 DE UM JSON { name: valor }), O MESMO FORMATO QUE OS CARTÕES JÁ LIAM NO PAINEL ANTIGO.
    // DATAS EM dd/mm/aaaa, COMO NOS FILTROS ANTIGOS.

    //DATA: SEM O BOTÃO DE LIMPAR DO MUI (clearable), QUE OCUPAVA ESPAÇO MESMO ESCONDIDO E CORTAVA O dd/mm/aaaa
    const LARGURA_PADRAO = { text: 200, number: 140, select: 180, date: 160, period: 160 }

    //PARÂMETROS QUE NÃO SEGUEM PARA A LISTAGEM FILTRADA: O FILTRO ANTERIOR E A PÁGINA DA PAGINAÇÃO
    const PARAMETROS_DESCARTADOS = ['parametro', 'pagina', 'acao', 'id']

    const valoresIniciais = (campos) => {
        const valores = {}
        campos.forEach((campo) => {
            campo.names.forEach((name, posicao) => {
                valores[name] = campo.values?.[posicao] ?? ''
            })
        })
        return valores
    }

    const CampoData = ({ name, valor, placeholder, largura, aoMudar }) => {

        //CALENDÁRIO ABRE AO CLICAR EM QUALQUER PARTE DO CAMPO, COMO NO FormDate
        const [aberto, setAberto] = useState(false)

        const data = valor ? dayjs(valor, 'DD/MM/YYYY', true) : null

        return (
            <DatePicker
                format="DD/MM/YYYY"
                name={name}
                value={data && data.isValid() ? data : null}
                open={aberto}
                onOpen={() => setAberto(true)}
                onClose={() => setAberto(false)}
                onChange={(novo) => aoMudar(name, novo && novo.isValid() ? novo.format('DD/MM/YYYY') : '')}
                slotProps={{
                    textField: {
                        size: 'small',
                        placeholder,
                        onClick: () => setAberto(true),
                        sx: { width: largura, cursor: 'pointer' },
                    },
                }}
            />
        )

    }

    const FiltrosCabecalho = ({ formulario }) => {

        const navigate = useNavigate()
        const { search } = useLocation()

        const campos = formulario?.fields || []

        const [valores, setValores] = useState(() => valoresIniciais(campos))

        //NOVA RESPOSTA DA API (FILTRO APLICADO, LIMPO OU OUTRA TELA): OS CAMPOS VOLTAM PARA OS VALORES QUE ELA MANDOU
        useEffect(() => {
            setValores(valoresIniciais(campos))
        }, [formulario])

        const aoMudar = (name, valor) => {
            setValores((atuais) => ({ ...atuais, [name]: valor }))
        }

        const irPara = (parametro) => {
            const params = new URLSearchParams(search)
            PARAMETROS_DESCARTADOS.forEach((nome) => params.delete(nome))
            if (parametro) {
                params.set('parametro', parametro)
            }
            navigate('?' + params.toString())
        }

        const filtrar = (event) => {
            event.preventDefault()
            irPara(utf8ParaBase64(JSON.stringify(valores)))
        }

        const limpar = () => irPara('')

        const renderizarEntrada = (campo, name, posicao) => {

            const valor       = valores[name] ?? ''
            const largura     = campo.width || LARGURA_PADRAO[campo.type] || 200
            const placeholder = campo.placeholders?.[posicao] || ''

            switch (campo.type) {

                case 'select':
                    //MESMO Combobox DOS FORMULÁRIOS (BUSCA POR PALAVRAS). A OPÇÃO VAZIA ("Todos") ENTRA COMO UMA OPÇÃO
                    return (
                        <div key={name} style={{ width: largura }}>
                            <Combobox
                                ariaLabel={campo.label || name}
                                placeholder={campo.empty !== false ? (campo.empty || 'Todos') : 'Selecione'}
                                options={[
                                    ...(campo.empty !== false ? [{ value: '', label: campo.empty || 'Todos' }] : []),
                                    ...(campo.options || []),
                                ]}
                                value={valor}
                                onChange={(novo) => aoMudar(name, String(novo ?? ''))}
                            />
                        </div>
                    )

                case 'date':
                case 'period':
                    return (
                        <CampoData
                            key={name}
                            name={name}
                            valor={valor}
                            placeholder={placeholder}
                            largura={largura}
                            aoMudar={aoMudar}
                        />
                    )

                case 'checkbox':
                    return (
                        <label key={name} className="flex items-center gap-2 h-10 cursor-pointer">
                            <input
                                type="checkbox"
                                name={name}
                                className="checkbox"
                                checked={valor !== ''}
                                onChange={(event) => aoMudar(name, event.target.checked ? '1' : '')}
                            />
                        </label>
                    )

                default:
                    return (
                        <input
                            key={name}
                            type={campo.type === 'number' ? 'number' : 'text'}
                            name={name}
                            className="input"
                            style={{ width: largura }}
                            placeholder={placeholder}
                            value={valor}
                            onChange={(event) => aoMudar(name, event.target.value)}
                        />
                    )

            }

        }

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <form className="card" onSubmit={filtrar}>
                    <div className="card-body flex flex-wrap items-end gap-4 py-4">

                        {campos.map((campo) => (
                            <div key={campo.names.join('|')} className="flex flex-col gap-1.5">

                                <span className="flex items-center gap-1 text-xs font-medium text-gray-700" title={campo.title || undefined}>
                                    {campo.label}
                                    {campo.title && (
                                        <KeenIcon icon="information-2" className="text-sm text-gray-500 cursor-help" />
                                    )}
                                </span>

                                <div className="flex items-center gap-2">
                                    {campo.names.map((name, posicao) => renderizarEntrada(campo, name, posicao))}
                                </div>

                            </div>
                        ))}

                        <div className="flex items-center gap-2">
                            <button type="submit" className="btn btn-primary">
                                <KeenIcon icon="magnifier" />
                                Filtrar
                            </button>
                            {formulario?.applied && (
                                <button type="button" className="btn btn-light" onClick={limpar}>
                                    Limpar
                                </button>
                            )}
                        </div>

                    </div>
                </form>
            </LocalizationProvider>
        )

    }

    export { FiltrosCabecalho }
