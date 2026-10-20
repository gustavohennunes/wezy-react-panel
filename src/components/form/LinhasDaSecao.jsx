    import { FormInput } from './FormInput'
    import { FormSelect } from './FormSelect'
    import { FormMultiSelect } from './FormMultiSelect'
    import { FormDate } from './FormDate'
    import { CustomCheckbox, CustomRadio } from './CustomFields'
    import { comChaves } from '@/utils/chavesUnicas'

    //TÍTULO/SUBTÍTULO À ESQUERDA DA LINHA, NA MESMA COLUNA DOS RÓTULOS DO FormInput
    const RotuloDaLinha = ({ title, subtitle, required = false }) => (
        <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
            <b>
                {title}
                {required && (
                    <span className="text-danger"> {' '} *</span>
                )}
            </b>
            {subtitle && (
                <span className="text-[10px] text-gray-600">
                    {' '}
                    {subtitle}{' '}
                </span>
            )}
        </div>
    )

    const LinhaRadio = ({ field, fieldName, className, atributos, formState, onRadio }) => (
        <div className={className} {...atributos}>

            <RotuloDaLinha title={field.title} subtitle={field.subtitle} required={field.required} />

            <div className="flex flex-col gap-1">
                {comChaves(field.field, (item) => item.value).map(({ item, chave }) => (
                    <CustomRadio
                        key={chave}
                        name={item.name}
                        value={item.value}
                        checked={formState[item.name] === item.value}
                        className={item.class}
                        onChange={(e) => onRadio(fieldName, e.target.value, item.class)}
                        label={item.title}
                    />
                ))}
            </div>

        </div>
    )

    const LinhaCheckbox = ({ field, className, atributos, formState, onCheckbox }) => (
        <div className={className} {...atributos}>

            <RotuloDaLinha title={field.title} subtitle={field.subtitle} required={field.required} />

            <div className={'flex flex-col gap-1 text-[13px]'}>
                {comChaves(field.field, (item) => `${item.name}|${item.value}`).map(({ item, chave }) => (
                    <CustomCheckbox
                        key={chave}
                        name={item.name}
                        value={item.value}
                        checked={Array.isArray(formState[item.name]) && formState[item.name].indexOf(item.value) !== -1}
                        onChange={(e) => onCheckbox(item.name, item.value, e.target.checked, item.class)}
                        label={item.title}
                    />
                ))}
            </div>

        </div>
    )

    const conteudoDaLinha = (linha) => (linha.columns || []).map((col) => col.content).join('|')

    //TABELA READ-ONLY ({header, rows}) — A PONTE ATUAL NÃO ENVIA OS DADOS
    //DO Tab (field chega vazio); NESSE CASO NÃO RENDERIZA NADA
    const LinhaTabela = ({ field, className, atributos }) => {

        const { title, subtitle, field: tabela } = field

        if (!(tabela.header?.length || tabela.rows?.length)) {
            return null
        }

        return (
            <div className={className} {...atributos}>

                {title !== false && (
                    <div className="form-label w-full lg:w-56 lg:min-w-56 lg:shrink-0 flex-col h-full justify-center">
                        <b>{title}</b>
                        {subtitle && (<span className="text-[10px] text-gray-600"> {subtitle} </span>)}
                    </div>
                )}

                <div className="w-full overflow-x-auto">
                    <table className="table table-auto w-full text-[13px]">

                        {(tabela.header || []).length > 0 && (
                            <thead>
                                {comChaves(tabela.header, conteudoDaLinha).map(({ item: linha, chave }) => (
                                    <tr key={chave}>
                                        {comChaves(linha.columns, (col) => col.content).map(({ item: col, chave: chaveDaColuna }) => (
                                            <th
                                                key={chaveDaColuna}
                                                style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
                                                dangerouslySetInnerHTML={{ __html: col.content }}
                                            />
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                        )}

                        <tbody>
                            {comChaves(tabela.rows, conteudoDaLinha).map(({ item: linha, chave }) => (
                                <tr key={chave}>
                                    {comChaves(linha.columns, (col) => col.content).map(({ item: col, chave: chaveDaColuna }) => (
                                        <td
                                            key={chaveDaColuna}
                                            dangerouslySetInnerHTML={{ __html: col.content }}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            </div>
        )

    }

    //Cab CONDICIONAL DENTRO DA SEÇÃO (VER FormContext) — TÍTULO EM LINHA, COM OS ATRIBUTOS
    //DA PONTE PARA O JS DO CARD (ex.: useLegacyModoCriacao) PODER ESCONDÊ-LO
    const TituloEmLinha = ({ valor, atributos }) => {

        const numero = valor?.number
        const titulo = String(valor?.title || '').split('//')[0].trim()

        return (
            <div className="flex items-center gap-2.5 px-4" {...atributos}>
                {(numero || numero === 0) && (
                    <span className="flex size-[22px] shrink-0 items-center justify-center rounded bg-primary text-[11px] font-semibold tabular-nums text-primary-inverse">
                        {String(numero).padStart(2, '0')}
                    </span>
                )}
                <h3 className="text-[13px] font-semibold leading-tight uppercase tracking-wide text-gray-900">{titulo}</h3>
            </div>
        )

    }

    //TIPOS DO LEGADO QUE O FormInput DESENHA (INPUT, TEXTAREA, ARQUIVO, EDITOR, COR, HTML DO CARTÃO...)
    const TIPOS_DO_FORM_INPUT = new Set(['Frm', 'Dtm', 'Psw', 'Val', 'Txt', 'Lis', 'Arq', 'Fto', 'Din', 'Cod', 'aut', 'Cor'])
    const TIPOS_DE_SELECT     = new Set(['Qnt', 'Sel', 'Man', 'Ico'])

    // UMA LINHA DO FORMULÁRIO, CONFORME O TIPO DO CAMPO NO CARTÃO. O QUE ELA PRECISA DA SEÇÃO (VALORES E
    // HANDLERS) CHEGA EM `secao`; className/atributos JÁ VÊM RESOLVIDOS (row_attr, ABA DE CATEGORIA)
    const CampoDaSecao = ({ field, idx, className, atributos, secao }) => {

        const { title, subtitle, field: fieldData, required, name, fieldClass } = field
        const fieldName = fieldData?.name || name
        const { formState } = secao

        const type = fieldData?.class && fieldData.class.includes('date-picker') ? 'Dta' : field.type

        if (TIPOS_DO_FORM_INPUT.has(type)) {

            if (fieldData.class.includes('data-hora')) {
                return (
                    <FormDate
                        title={title}
                        idx={idx}
                        ampm={true}
                        fieldName={fieldName}
                        fieldData={fieldData}
                        formState={formState}
                        fieldClass={fieldClass}
                        combinedClass={className}
                        parsedAttributes={atributos}
                        handleDateChange={secao.onDate}
                    />
                )
            }

            return (
                <FormInput
                    type={type}
                    title={title}
                    subtitle={subtitle}
                    fieldMask={fieldData.mask}
                    fieldName={fieldName}
                    fieldClass={fieldClass}
                    fieldData={fieldData}
                    formState={formState}
                    required={required}
                    combinedClass={className}
                    rowAttr={atributos}
                    handleInputChange={secao.onInput}
                    buscaCep={secao.buscaCepDoCampo(field)}
                />
            )

        }

        if (TIPOS_DE_SELECT.has(type)) {
            return (
                <FormSelect
                    field={field}
                    fieldName={fieldName}
                    fieldData={fieldData}
                    formState={formState}
                    required={required}
                    combinedClass={className}
                    rowAttr={atributos}
                    handleSelectChange={secao.onSelect}
                />
            )
        }

        switch (type) {

            case 'Rdo':
                return <LinhaRadio field={field} fieldName={fieldName} className={className} atributos={atributos} formState={formState} onRadio={secao.onRadio} />

            case 'Ckb':
                return <LinhaCheckbox field={field} className={className} atributos={atributos} formState={formState} onCheckbox={secao.onCheckbox} />

            case 'Dta':
                return (
                    <FormDate
                        title={title}
                        idx={idx}
                        fieldName={fieldName}
                        fieldData={fieldData}
                        formState={formState}
                        fieldClass={fieldClass}
                        combinedClass={className}
                        parsedAttributes={atributos}
                        handleDateChange={secao.onDate}
                    />
                )

            case 'Mul':
                return (
                    <FormMultiSelect
                        title={title}
                        subtitle={subtitle}
                        fieldName={fieldName}
                        fieldData={fieldData}
                        required={required}
                        combinedClass={className}
                        rowAttr={atributos}
                    />
                )

            case 'Tab':
                return <LinhaTabela field={field} className={className} atributos={atributos} />

            case 'Cab':
                return <TituloEmLinha valor={fieldData?.value} atributos={atributos} />

            //Hdn NÃO RENDERIZA LINHA — OS VALORES VÊM EM form.hidden_fields (FormContext)
            default:
                return null

        }

    }

    export { CampoDaSecao }
