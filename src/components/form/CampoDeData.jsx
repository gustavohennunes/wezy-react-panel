    import { useEffect, useLayoutEffect, useRef, useState } from 'react'
    import ClickAwayListener from '@mui/material/ClickAwayListener'
    import IconButton from '@mui/material/IconButton'
    import InputAdornment from '@mui/material/InputAdornment'
    import Paper from '@mui/material/Paper'
    import Popper from '@mui/material/Popper'
    import TextField from '@mui/material/TextField'
    import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
    import { CalendarIcon } from '@mui/x-date-pickers/icons'
    import dayjs from 'dayjs'
    import customParseFormat from 'dayjs/plugin/customParseFormat'
    import { DatePickersProvider } from './DatePickersProvider'

    dayjs.extend(customParseFormat)

    export const FORMATO_DATA      = 'DD/MM/YYYY'
    export const FORMATO_DATA_HORA = 'DD/MM/YYYY - HH:mm'

    // CAMPO DE DATA (E DATA/HORA) DIGITÁVEL. ANTES ERA O DatePicker DO MUI: CAMPO EM SEÇÕES (contenteditable, DD/MM/YYYY),
    // LENTO PARA DIGITAR, E O CLIQUE ABRIA O CALENDÁRIO E TIRAVA O FOCO — PRECISAVA DE DOIS CLIQUES PARA DIGITAR.
    // AQUI É UM <input> COMUM: CLICOU, DIGITOU. A MÁSCARA SÓ COLOCA AS BARRAS (E O " - " / ":" DA HORA) ENTRE OS NÚMEROS,
    // E O CALENDÁRIO ABRE SÓ PELO BOTÃO (OU Alt+↓). O VISUAL CONTINUA O DO MUI (TextField CONTORNADO, ÍCONE E POPUP COM O
    // DateCalendar), COM A MESMA ALTURA E FONTE DO PICKER ANTIGO (.campo-de-data NO globals.css)
    // O VALOR É O TEXTO NO FORMATO DA TELA (dd/mm/aaaa OU dd/mm/aaaa - hh:mm), O MESMO QUE O <input name> ENVIA NO POST.
    // aoMudar SÓ RECEBE DATA COMPLETA E VÁLIDA (OU '' AO LIMPAR); DATA INCOMPLETA/INVÁLIDA BLOQUEIA O ENVIO DO FORMULÁRIO

    const LIMITE_DE_DIGITOS = { data: 8, dataHora: 12 }

    //"1/5/2026" VIRA "01/05/2026": NÚMERO SOZINHO ANTES DE UM SEPARADOR DIGITADO GANHA O ZERO
    const completarComZero = (bruto) => bruto.replace(/(?<!\d)(\d)(?=[/:])/g, '0$1')

    const mascarar = (bruto, comHora) => {
        const digitos = completarComZero(bruto).replace(/\D/g, '').slice(0, comHora ? LIMITE_DE_DIGITOS.dataHora : LIMITE_DE_DIGITOS.data)
        let texto = digitos.slice(0, 2)
        if (digitos.length > 2) texto += '/' + digitos.slice(2, 4)
        if (digitos.length > 4) texto += '/' + digitos.slice(4, 8)
        if (digitos.length > 8) texto += ' - ' + digitos.slice(8, 10)
        if (digitos.length > 10) texto += ':' + digitos.slice(10, 12)
        return texto
    }

    const interpretar = (texto, comHora) => {
        const data = dayjs(texto, comHora ? FORMATO_DATA_HORA : FORMATO_DATA, true)
        return data.isValid() && data.year() >= 1000 ? data : null
    }

    //AO SAIR DO CAMPO: "1505" GANHA O ANO ATUAL, "150526" VIRA 2026 E, NA DATA/HORA, A DATA SEM HORA GANHA 00:00
    const completarAoSair = (texto, comHora) => {
        const digitos = texto.replace(/\D/g, '')
        if (digitos.length === 4) return mascarar(digitos + dayjs().format('YYYY'), comHora)
        if (digitos.length === 6) return mascarar(digitos.slice(0, 4) + '20' + digitos.slice(4), comHora)
        if (comHora && digitos.length === 8) return mascarar(digitos + '0000', comHora)
        return texto
    }

    //POSIÇÃO NO TEXTO MASCARADO DEPOIS DO N-ÉSIMO DÍGITO: O CURSOR NÃO PULA PARA O FIM AO EDITAR NO MEIO
    const posicaoDepoisDosDigitos = (texto, quantidade) => {
        if (quantidade === 0) return 0
        let vistos = 0
        for (let posicao = 0; posicao < texto.length; posicao++) {
            if (/\d/.test(texto[posicao]) && ++vistos === quantidade) return posicao + 1
        }
        return texto.length
    }

    const CampoDeData = ({ name, id, valor = '', comHora = false, required = false, placeholder, tamanho, className = '', style, aoMudar }) => {

        const campoRef       = useRef(null)
        const inputRef       = useRef(null)
        const cursorPendente = useRef(null)
        const [texto, setTexto]   = useState(valor || '')
        const [aberto, setAberto] = useState(false)

        //VALOR NOVO VINDO DE FORA (CALENDÁRIO, RESET DO FORMULÁRIO, OUTRA RESPOSTA DA API): O TEXTO ACOMPANHA.
        //NO RENDER, COMO NO FiltrosCabecalho. DIGITANDO, O valor SÓ MUDA COM DATA COMPLETA, ENTÃO NÃO APAGA O QUE ESTÁ PELA METADE
        const [valorAnterior, setValorAnterior] = useState(valor)
        if (valor !== valorAnterior) {
            setValorAnterior(valor)
            setTexto(valor || '')
        }

        const data = interpretar(texto, comHora)

        const publicar = (novo) => {
            if (novo === '') aoMudar?.('')
            else if (interpretar(novo, comHora)) aoMudar?.(novo)
        }

        const aoDigitar = (event) => {
            const campo   = event.target
            const posicao = campo.selectionStart ?? campo.value.length
            const digitosAntes = completarComZero(campo.value.slice(0, posicao)).replace(/\D/g, '').length
            const novo = mascarar(campo.value, comHora)
            cursorPendente.current = posicaoDepoisDosDigitos(novo, digitosAntes)
            setTexto(novo)
            publicar(novo)
        }

        const aoSair = () => {
            const completo = completarAoSair(texto, comHora)
            if (completo !== texto) {
                setTexto(completo)
                publicar(completo)
            }
        }

        const aoTeclar = (event) => {
            if (event.altKey && event.key === 'ArrowDown') {
                event.preventDefault()
                setAberto(true)
            } else if (event.key === 'Escape' && aberto) {
                setAberto(false)
            }
        }

        //DIA ESCOLHIDO NO CALENDÁRIO. NA DATA/HORA MANTÉM A HORA JÁ DIGITADA (OU 00:00). partial = SÓ TROCOU O ANO NA LISTA
        const aoEscolherDia = (dia, selecao) => {
            if (!dia?.isValid() || selecao === 'partial') return
            const hora = comHora ? (data ? data.format('HH:mm') : '00:00') : ''
            const novo = dia.format(FORMATO_DATA) + (comHora ? ' - ' + hora : '')
            setTexto(novo)
            publicar(novo)
            setAberto(false)
            inputRef.current?.focus()
        }

        useLayoutEffect(() => {
            const campo = inputRef.current
            if (cursorPendente.current === null || !campo || document.activeElement !== campo) return
            campo.setSelectionRange(cursorPendente.current, cursorPendente.current)
            cursorPendente.current = null
        }, [texto])

        //DATA PELA METADE OU INEXISTENTE (31/02) NÃO VAI NO POST: O NAVEGADOR AVISA NO ENVIO, COMO NO required
        const invalido = texto !== '' && !data
        useEffect(() => {
            inputRef.current?.setCustomValidity(invalido ? `Data inválida: use ${comHora ? 'dd/mm/aaaa - hh:mm' : 'dd/mm/aaaa'}` : '')
        }, [invalido, comHora])

        return (
            <DatePickersProvider>
                <ClickAwayListener onClickAway={() => setAberto(false)}>
                    <div className={`campo-de-data ${className}`.trim()} style={style}>

                        <TextField
                            ref={campoRef}
                            inputRef={inputRef}
                            id={id}
                            name={name}
                            size={tamanho === 'sm' ? 'small' : 'medium'}
                            //LARGURA FIXA SÓ NOS FILTROS (style.width); NO FORMULÁRIO FICA A LARGURA NATURAL DO MUI, COMO O PICKER ANTIGO
                            fullWidth={Boolean(style?.width)}
                            autoComplete="off"
                            value={texto}
                            required={required}
                            error={invalido}
                            placeholder={placeholder ?? (comHora ? 'dd/mm/aaaa - hh:mm' : 'dd/mm/aaaa')}
                            onChange={aoDigitar}
                            onBlur={aoSair}
                            onKeyDown={aoTeclar}
                            slotProps={{
                                htmlInput: { inputMode: 'numeric' },
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" tabIndex={-1} aria-label="Abrir calendário" onClick={() => setAberto((atual) => !atual)}>
                                                <CalendarIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        {/* NO PORTAL (NÃO É CORTADO PELO overflow DO CARD). O ClickAwayListener DO MUI CONSIDERA O PORTAL PARTE DO CAMPO */}
                        <Popper open={aberto} anchorEl={campoRef.current} placement="bottom-start" sx={{ zIndex: 1300 }}>
                            <Paper elevation={8} sx={{ mt: 0.5 }}>
                                <DateCalendar value={data} onChange={aoEscolherDia} />
                            </Paper>
                        </Popper>

                    </div>
                </ClickAwayListener>
            </DatePickersProvider>
        )

    }

    export { CampoDeData }
