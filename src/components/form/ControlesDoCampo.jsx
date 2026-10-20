    import { useMemo } from 'react'
    import { IMaskInput } from 'react-imask'
    import { CurrencyInput } from 'react-currency-mask'
    import { FormFile } from './FormFile'
    import { FormColorPicker } from './FormColorPicker'
    import { FormIconSelector } from './FormIconSelector'
    import { FormCodeEditor } from './FormCodeEditor'
    import { temEditorDeCodigo } from './editorGlobal'
    import { isLegacyIconField } from '@/utils/legacyIcons'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { resolveFormMask, formatarSite } from '@/utils/formMask'

    // CONTROLES DO FormInput, UM POR TIPO DE CAMPO DO LEGADO. TODOS RECEBEM AS MESMAS PROPS (VER FormInput):
    // { inputId, fieldName, fieldMask, fieldClass, fieldData, valor, required, onValor, buscaCep, rotulo }
    // rotulo: TÍTULO DA LINHA, PARA O CONTROLE QUE O LEITOR DE TELA NÃO LIGA SOZINHO AO <label htmlFor> (DENTRO DE COMPONENTE DE MÁSCARA/ARQUIVO)

    //CAMPOS NÃO OCUPAM A LINHA TODA: O CONTEÚDO É CURTO E O INPUT GIGANTE FICAVA VAZIO.
    //O TEXTAREA É MAIS LARGO; O EDITOR DE CÓDIGO (ace) CONTINUA 100% PORQUE NASCE NO WRAPPER
    const LARGURA_CAMPO = 'max-w-[525px]'
    const LARGURA_TEXTO = 'max-w-[700px]'

    const TAMANHO_MAXIMO_DO_ARQUIVO = 5 * 1024 * 1024

    const classeDoInput = (fieldClass, fieldData) => `input w-full ${LARGURA_CAMPO} ${fieldClass} ${fieldData.class}`

    //data-buscar-cep="cep": BOTÃO "Buscar endereço" AO LADO DO CAMPO (VER useBuscaCep)
    const ComBuscaDeCep = ({ buscaCep, children }) => (
        <div className={`flex w-full ${LARGURA_CAMPO} gap-2`}>
            <div className="min-w-0 flex-1 [&>.input]:max-w-none">{children}</div>
            <button
                type="button"
                className="btn btn-primary shrink-0 gap-1.5"
                onClick={buscaCep.buscar}
                disabled={buscaCep.buscando}
            >
                <i className="ki-filled ki-geolocation text-base" />
                {buscaCep.buscando ? 'Buscando...' : 'Buscar endereço'}
            </button>
        </div>
    )

    const CampoTexto = ({ inputId, fieldName, fieldMask, fieldClass, fieldData, valor, required, onValor, buscaCep }) => {

        //MÁSCARA COM REFERÊNCIA ESTÁVEL: O resolveFormMask DEVOLVE UM ARRAY NOVO A CADA RENDER (TELEFONE FIXO/CELULAR) E O
        //IMaskInput RECONFIGURAVA A MÁSCARA EM TODO RENDER DO FORMULÁRIO
        const inputMask = useMemo(() => resolveFormMask(fieldMask, fieldName), [fieldMask, fieldName])

        //CAMPO DE CEP: ENTER BUSCA O ENDEREÇO EM VEZ DE ENVIAR O FORMULÁRIO (COMO NO LEGADO)
        const aoTeclar = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                buscaCep.buscar()
            }
        }

        const input = (
            <IMaskInput
                mask={inputMask}
                className={classeDoInput(fieldClass, fieldData)}
                name={fieldName}
                id={inputId}
                value={valor || ''}
                required={required}
                //COM MÁSCARA O VALOR VEM DO onAccept (RECOMENDADO PELO react-imask): A MÁSCARA REESCREVE O TEXTO SOZINHA
                //(TROCA FIXO/CELULAR, COLAR, AUTOPREENCHIMENTO) E O onChange PODIA NÃO ACOMPANHAR — O ESTADO FICAVA COM O
                //VALOR ANTIGO E, NO PRÓXIMO RENDER DO FORMULÁRIO, O CAMPO VOLTAVA/SE APAGAVA (TELEFONE/WHATSAPP). SEM
                //MÁSCARA O IMask NÃO É CRIADO E O onAccept NÃO DISPARA: AÍ CONTINUA O onChange
                onAccept={inputMask ? onValor : undefined}
                onChange={inputMask ? undefined : (e) => onValor(fieldMask === 'Site' ? formatarSite(e.target.value) : e.target.value)}
                onKeyDown={buscaCep ? aoTeclar : undefined}
            />
        )

        return buscaCep ? <ComBuscaDeCep buscaCep={buscaCep}>{input}</ComBuscaDeCep> : input

    }

    //EXTRAI O maxlength DO attr LEGADO (STRING HTML) QUANDO EXISTIR
    const maxLengthDoAttr = (attr) => {
        const match = /maxlength="(\d+)"/.exec(attr || '')
        return match ? parseInt(match[1], 10) : undefined
    }

    const CampoValor = ({ inputId, fieldName, fieldClass, fieldData, valor, required, onValor, rotulo }) => (
        <CurrencyInput
            hideSymbol={true}
            onChangeValue={(event, originalValue, maskedValue) => onValor(maskedValue)}
            value={valor || 0}
            InputElement={
                <input
                    type={fieldData.type}
                    className={classeDoInput(fieldClass, fieldData)}
                    name={fieldName}
                    id={inputId}
                    aria-label={rotulo}
                    required={required}
                    maxLength={maxLengthDoAttr(fieldData.attr) || 13}
                />
            }
        />
    )

    const CampoSenha = ({ inputId, fieldName, fieldClass, fieldData, required, onValor, rotulo }) => (
        <div className={classeDoInput(fieldClass, fieldData)} data-toggle-password="true">
            <input
                name={fieldName}
                id={inputId}
                aria-label={rotulo}
                type="password"
                required={required}
                onChange={(e) => onValor(e.target.value)}
            />
            <div className="btn btn-icon" data-toggle-password-trigger="true">
                <i className="ki-outline ki-eye toggle-password-active:hidden"></i>
                <i className="ki-outline ki-eye-slash hidden toggle-password-active:block"></i>
            </div>
        </div>
    )

    const CampoTextoLongo = ({ inputId, fieldName, fieldClass, fieldData, valor, required, onValor, rotulo }) => {

        //CAMPOS QUE O index.php LEGADO VIRAVA EDITOR DE CÓDIGO (ex.: CSS/JS DAS SECTIONS)
        if (temEditorDeCodigo(fieldName)) {
            return <FormCodeEditor fieldName={fieldName} value={valor || ''} onChange={onValor} />
        }

        return (
            <textarea
                className={`input w-full ${LARGURA_TEXTO} min-h-[140px] py-2 leading-relaxed ${fieldClass} ${fieldData.class}`}
                name={fieldName}
                id={inputId}
                aria-label={rotulo}
                value={valor || ''}
                required={required}
                onChange={(e) => onValor(e.target.value)}
            />
        )

    }

    //A PONTE PODE MANDAR HTML NO VALOR (LINKS DE DOWNLOAD, <br>) — RENDERIZA COMO HTML
    const CampoHtml = ({ fieldData }) => (
        <LegacyHtml className={fieldData.class + ' text-[13px]'} html={(fieldData.value || '') + (fieldData.extra_html || '')} />
    )

    //FORMATOS PERMITIDOS ENVIADOS PELA PONTE (panel/module) VIRAM O accept DO INPUT
    const acceptDoCampo = (fieldData, padrao) =>
        Array.isArray(fieldData.formats) && fieldData.formats.length > 0 ? fieldData.formats.map((format) => `.${format}`).join(',') : padrao

    const campoArquivo = (padrao) => {
        const CampoArquivo = ({ inputId, fieldName, fieldData, valor, rotulo }) => (
            <FormFile
                id={inputId}
                rotulo={rotulo}
                fieldName={fieldName}
                multiple={true}
                value={valor || ''}
                accept={acceptDoCampo(fieldData, padrao)}
                maxSize={TAMANHO_MAXIMO_DO_ARQUIVO}
            />
        )
        return CampoArquivo
    }

    const CampoAut = ({ fieldData }) => {

        //GRADE DE SPRITES DO CARTÃO DE MÓDULOS VIRA O SELETOR DE KEENICONS (MESMOS HIDDEN FrmIconeX/FrmIconeY)
        if (isLegacyIconField(fieldData.extra_html)) {
            return <FormIconSelector className={fieldData.class} html={fieldData.extra_html} />
        }

        return (
            <div className={fieldData.class + ' text-[13px] w-full'}>
                <LegacyHtml style={{ display: 'contents' }} html={fieldData.extra_html} />
            </div>
        )

    }

    const CampoCor = ({ fieldName, valor, onValor }) => (
        <FormColorPicker fieldName={fieldName} color={valor} onChange={onValor} />
    )

    //Dtm SEM data-hora NÃO TEM CONTROLE (O COM data-hora VAI PARA O FormDate ANTES DE CHEGAR AQUI)
    const CONTROLES_DO_CAMPO = {
        Frm: CampoTexto,
        Val: CampoValor,
        Psw: CampoSenha,
        Txt: CampoTextoLongo,
        Lis: CampoHtml,
        Cod: CampoHtml,
        Din: CampoHtml,
        Fto: campoArquivo('image/*'),
        Arq: campoArquivo('*'),
        aut: CampoAut,
        Cor: CampoCor,
    }

    const ControleDoCampo = ({ type, ...props }) => {
        const Controle = CONTROLES_DO_CAMPO[type]
        return Controle ? <Controle {...props} /> : null
    }

    export { ControleDoCampo }
