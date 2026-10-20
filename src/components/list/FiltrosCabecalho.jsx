    import { useState } from 'react'
    import { useLocation, useNavigate } from 'react-router-dom'
    import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
    import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
    import { DatePicker } from '@mui/x-date-pickers/DatePicker'
    import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
    import dayjs from 'dayjs'
    import customParseFormat from 'dayjs/plugin/customParseFormat'
    import { KeenIcon } from '@/components/keenicons'
    import { Combobox } from '@/components/form/FormCombobox'
    import { utf8ParaBase64 } from '@/utils/base64'

    dayjs.extend(customParseFormat)

    // FILTROS DO CABEÇALHO DA LISTAGEM DEFINIDOS EM ARRAY NO CARTÃO ($formCabecalho). A API (class/HeaderFilters.php) MANDA
    // OS CAMPOS EM extra_content.header_form JÁ COM OS VALORES ATUAIS E AS OPÇÕES. AO FILTRAR, OS VALORES VÃO PARA A URL EM
    // &parametro= (base64 DE UM JSON { name: valor }), O MESMO FORMATO QUE OS CARTÕES JÁ LIAM NO PAINEL ANTIGO.
    // DATAS EM dd/mm/aaaa E DATA/HORA EM dd/mm/aaaa - hh:mm, COMO NOS FILTROS E FORMULÁRIOS ANTIGOS.
    // CAMPOS MÚLTIPLOS (multiselect E GRUPO DE checkbox) TÊM VALOR EM ARRAY.

    //DATA: SEM O BOTÃO DE LIMPAR DO MUI (clearable), QUE OCUPAVA ESPAÇO MESMO ESCONDIDO E CORTAVA O dd/mm/aaaa
    const LARGURA_PADRAO = {
        text: 200, email: 220, tel: 160, url: 220, number: 140, color: 70, time: 120, month: 160,
        textarea: 260, select: 180, multiselect: 260, date: 160, datetime: 210, period: 160,
    }

    //TIPOS QUE VIRAM <input type="..."> DIRETO
    const TIPOS_INPUT = ['text', 'email', 'tel', 'url', 'number', 'color', 'time', 'month']

    //PARÂMETROS QUE NÃO SEGUEM PARA A LISTAGEM FILTRADA: O FILTRO ANTERIOR E A PÁGINA DA PAGINAÇÃO
    const PARAMETROS_DESCARTADOS = ['parametro', 'pagina', 'acao', 'id']

    const FORMATO_DATA      = 'DD/MM/YYYY'
    const FORMATO_DATA_HORA = 'DD/MM/YYYY - HH:mm'

    const valoresIniciais = (campos) => {
        const valores = {}
        campos.forEach((campo) => {
            campo.names.forEach((name, posicao) => {
                const valor = campo.values?.[posicao]
                valores[name] = campo.multiple ? (Array.isArray(valor) ? valor.map(String) : []) : (valor ?? '')
            })
        })
        return valores
    }

    //OPÇÃO VAZIA ("Todos") DO select E DO radio, A MENOS QUE O CARTÃO TENHA PASSADO empty => false
    const opcoesComVazia = (campo) => [
        ...(campo.empty !== false ? [{ value: '', label: campo.empty || 'Todos' }] : []),
        ...(campo.options || []),
    ]

    const CampoData = ({ name, valor, placeholder, largura, aoMudar, comHora = false }) => {

        //CALENDÁRIO ABRE AO CLICAR EM QUALQUER PARTE DO CAMPO, COMO NO FormDate
        const [aberto, setAberto] = useState(false)

        const formato = comHora ? FORMATO_DATA_HORA : FORMATO_DATA
        const data    = valor ? dayjs(valor, formato, true) : null
        const Picker  = comHora ? DateTimePicker : DatePicker

        return (
            <Picker
                format={formato}
                ampm={comHora ? false : undefined}
                name={name}
                value={data && data.isValid() ? data : null}
                open={aberto}
                onOpen={() => setAberto(true)}
                onClose={() => setAberto(false)}
                onChange={(novo) => aoMudar(name, novo && novo.isValid() ? novo.format(formato) : '')}
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

        //NOVA RESPOSTA DA API (FILTRO APLICADO, LIMPO OU OUTRA TELA): OS CAMPOS VOLTAM PARA OS VALORES QUE ELA MANDOU.
        //DURANTE O RENDER, NÃO NUM useEffect — SEM UM FRAME COM OS VALORES ANTERIORES
        const [formularioAnterior, setFormularioAnterior] = useState(formulario)
        if (formulario !== formularioAnterior) {
            setFormularioAnterior(formulario)
            setValores(valoresIniciais(campos))
        }

        const aoMudar = (name, valor) => {
            setValores((atuais) => ({ ...atuais, [name]: valor }))
        }

        //GRUPO DE checkbox: MARCA/DESMARCA UM VALOR DO ARRAY
        const alternaNaLista = (name, valor, marcado) => {
            setValores((atuais) => {
                const lista = Array.isArray(atuais[name]) ? atuais[name] : []
                return { ...atuais, [name]: marcado ? [...lista.filter((item) => item !== valor), valor] : lista.filter((item) => item !== valor) }
            })
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

            const valor       = valores[name] ?? (campo.multiple ? [] : '')
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
                                options={opcoesComVazia(campo)}
                                value={valor}
                                onChange={(novo) => aoMudar(name, String(novo ?? ''))}
                            />
                        </div>
                    )

                case 'multiselect':
                    return (
                        <div key={name} style={{ width: largura }}>
                            <Combobox
                                multiple
                                ariaLabel={campo.label || name}
                                placeholder={placeholder || 'Todos'}
                                options={campo.options || []}
                                value={valor}
                                onChange={(novos) => aoMudar(name, (novos || []).map(String))}
                            />
                        </div>
                    )

                case 'checkbox':
                    //COM options: GRUPO, VALOR EM ARRAY. SEM options: UM QUADRADINHO, '1' OU ''
                    if (campo.multiple) {
                        const marcados = new Set(Array.isArray(valor) ? valor : [valor])
                        return (
                            <div key={name} className="flex flex-wrap items-center gap-x-4 gap-y-2 min-h-10">
                                {(campo.options || []).map((opcao) => (
                                    <label key={opcao.value} className="flex items-center gap-2 cursor-pointer text-2sm text-gray-800">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={marcados.has(String(opcao.value))}
                                            onChange={(event) => alternaNaLista(name, String(opcao.value), event.target.checked)}
                                        />
                                        {opcao.label}
                                    </label>
                                ))}
                            </div>
                        )
                    }
                    return (
                        <label key={name} className="flex items-center gap-2 h-10 cursor-pointer">
                            <input
                                type="checkbox"
                                name={name}
                                className="checkbox"
                                checked={valor !== ''}
                                onChange={(event) => aoMudar(name, event.target.checked ? '1' : '')}
                                aria-label={campo.label || name}
                            />
                        </label>
                    )

                case 'radio':
                    return (
                        <div key={name} className="flex flex-wrap items-center gap-x-4 gap-y-2 min-h-10" role="radiogroup" aria-label={campo.label || name}>
                            {opcoesComVazia(campo).map((opcao) => (
                                <label key={opcao.value} className="flex items-center gap-2 cursor-pointer text-2sm text-gray-800">
                                    <input
                                        type="radio"
                                        name={name}
                                        className="radio radio-sm"
                                        value={opcao.value}
                                        checked={valor === String(opcao.value)}
                                        onChange={() => aoMudar(name, String(opcao.value))}
                                    />
                                    {opcao.label}
                                </label>
                            ))}
                        </div>
                    )

                case 'textarea':
                    return (
                        <textarea
                            key={name}
                            name={name}
                            className="input min-h-10 h-20 py-2 leading-relaxed"
                            style={{ width: largura }}
                            placeholder={placeholder}
                            value={valor}
                            onChange={(event) => aoMudar(name, event.target.value)}
                        />
                    )

                case 'date':
                case 'period':
                case 'datetime':
                    return (
                        <CampoData
                            key={name}
                            name={name}
                            valor={valor}
                            placeholder={placeholder}
                            largura={largura}
                            aoMudar={aoMudar}
                            comHora={campo.type === 'datetime'}
                        />
                    )

                default:
                    return (
                        <input
                            key={name}
                            type={TIPOS_INPUT.includes(campo.type) ? campo.type : 'text'}
                            name={name}
                            className={campo.type === 'color' ? 'input p-1' : 'input'}
                            style={{ width: largura }}
                            placeholder={placeholder}
                            value={valor}
                            onChange={(event) => aoMudar(name, event.target.value)}
                        />
                    )

            }

        }

        //hidden NÃO APARECE: O VALOR JÁ ESTÁ EM valores E VAI JUNTO NO &parametro=
        const camposVisiveis = campos.filter((campo) => campo.type !== 'hidden')

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <form className="card" onSubmit={filtrar}>
                    <div className="card-body flex flex-wrap items-end gap-4 py-4">

                        {camposVisiveis.map((campo) => (
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
