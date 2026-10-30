    import dayjs from 'dayjs';
    import customParseFormat from 'dayjs/plugin/customParseFormat';
    import { CampoDeData, FORMATO_DATA, FORMATO_DATA_HORA } from './CampoDeData';

    dayjs.extend(customParseFormat);

    // VALOR DO formState (YYYY-MM-DD, DD/MM/YYYY OU DD/MM/YYYY - HH:mm, CONFORME VEIO DA API OU DO CAMPO) NO FORMATO DA TELA
    const textoDaData = (valor, comHora) => {

        const formato = comHora ? FORMATO_DATA_HORA : FORMATO_DATA

        //O estadoInicialDaSecao CONVERTE O VALOR DA PONTE EM Date, MONTADO EM UTC A PARTIR DO DIA/HORA DO LEGADO (Dta AO
        //MEIO-DIA UTC): LÊ OS CAMPOS EM UTC PARA MOSTRAR O MESMO DIA/HORA. SEM ISSO A DATA GRAVADA ABRIA VAZIA
        if (valor instanceof Date) {
            if (isNaN(valor)) return ''
            const doisDigitos = (numero) => String(numero).padStart(2, '0')
            const data = `${doisDigitos(valor.getUTCDate())}/${doisDigitos(valor.getUTCMonth() + 1)}/${valor.getUTCFullYear()}`
            return comHora ? `${data} - ${doisDigitos(valor.getUTCHours())}:${doisDigitos(valor.getUTCMinutes())}` : data
        }

        if (!valor || typeof valor !== 'string') return ''
        const formatos = comHora
            ? [FORMATO_DATA_HORA, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', FORMATO_DATA, 'YYYY-MM-DD']
            : [FORMATO_DATA, 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', FORMATO_DATA_HORA]

        //0000-00-00 DO BANCO É "SEM DATA"
        if (/^0{4}-0{2}-0{2}/.test(valor) || /^0{2}\/0{2}\/0{4}/.test(valor)) return ''

        const data = dayjs(valor.trim(), formatos, true)
        return data.isValid() ? data.format(formato) : ''

    }

    const FormDate = ({ title, idx, fieldName, fieldClass, combinedClass, rowAttr, parsedAttributes, fieldData, formState, handleDateChange, ampm = false }) => {

        const requiredField = (fieldClass + fieldData.class).indexOf('obg') !== -1

        //formState CONTINUA COM O MESMO FORMATO DE ANTES: YYYY-MM-DD NA DATA E DD/MM/YYYY - HH:mm NA DATA/HORA.
        //O POST LEVA O TEXTO DO <input name> (dd/mm/aaaa), COMO O DatePicker DO MUI FAZIA
        const aoMudar = (texto) => {
            if (texto === '') return handleDateChange(fieldName, null)
            handleDateChange(fieldName, ampm ? texto : dayjs(texto, FORMATO_DATA, true).format('YYYY-MM-DD'))
        }

        return (
            //rowAttr OU parsedAttributes: OS DOIS CHAMADORES DO LinhasDaSecao MANDAM parsedAttributes (data-valid-*, id DA LINHA)
            <div className={combinedClass} {...(rowAttr || parsedAttributes)}>

                {/* flex-col COMO OS OUTROS CAMPOS: justify-center CENTRALIZA NA VERTICAL. EM LINHA (flex) ELE
                    CENTRALIZAVA O TÍTULO NA HORIZONTAL, FORA DO ALINHAMENTO À ESQUERDA DO FORMULÁRIO */}
                <label htmlFor={`${fieldName}-${idx}`} className="form-label flex flex-col w-full lg:w-56 lg:min-w-56 lg:shrink-0 h-full justify-center">
                    <b>
                        {fieldData.title || title}
                        {requiredField && (
                            <span className="text-danger"> *</span>
                        )}
                    </b>
                </label>

                <CampoDeData
                    id={`${fieldName}-${idx}`}
                    name={fieldName}
                    comHora={ampm}
                    required={requiredField}
                    valor={textoDaData(formState[fieldName], ampm)}
                    aoMudar={aoMudar}
                />

            </div>
        )

    }

    export { FormDate }
