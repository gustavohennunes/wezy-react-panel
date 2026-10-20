    import { useId } from 'react'
    import { ControleDoCampo } from './ControlesDoCampo'

    // LINHA DO FORMULÁRIO COM RÓTULO À ESQUERDA E O CONTROLE DO TIPO DO CAMPO (VER ControlesDoCampo)
    const FormInput = ({ type, title, subtitle = '', combinedClass, rowAttr, fieldName, fieldMask, fieldClass = '', fieldData, formState, required = false, handleInputChange, buscaCep = null }) => {

        //LIGA O <label> DO TÍTULO AO CONTROLE DO CAMPO (LEITOR DE TELA E CLIQUE NO TÍTULO FOCAM O INPUT). O id É O DO LEGADO
        //(A PONTE MANDA id = NOME DO CAMPO): O JS DOS CARTÕES USA $('#FrmEmails_cliente').val(...) ETC. COM O id DO useId
        //(":r5:") ESSES SELETORES NÃO ACHAVAM NADA (ex.: emails-disparos NÃO PREENCHIA O E-MAIL AO ESCOLHER O DESTINATÁRIO)
        const idGerado = useId()
        const inputId  = fieldData?.id || idGerado

        //CLASSE obg DO LEGADO = CAMPO OBRIGATÓRIO (O ASTERISCO NO TÍTULO)
        const obrigatorio = (fieldClass + fieldData.class).includes('obg')

        return (
            <div className={combinedClass} {...rowAttr}>

                {title !== false && (
                    <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                        <label htmlFor={inputId}>
                            <b>
                                {title}
                                {obrigatorio && (
                                    <span className="text-danger"> *</span>
                                )}
                            </b>
                        </label>
                        {subtitle && <span className="text-[10px] text-gray-600"> {subtitle} </span>}
                    </div>
                )}

                <div className="w-full lg:flex-1 min-w-0">
                    <ControleDoCampo
                        type={type}
                        inputId={inputId}
                        fieldName={fieldName}
                        fieldMask={fieldMask}
                        fieldClass={fieldClass}
                        fieldData={fieldData}
                        valor={formState[fieldName]}
                        required={required}
                        onValor={(valor) => handleInputChange(fieldName, valor)}
                        buscaCep={buscaCep}
                        rotulo={typeof title === 'string' ? title : undefined}
                    />
                </div>

            </div>
        )

    }

    export { FormInput }
