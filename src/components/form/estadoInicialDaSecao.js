    const opcaoSelecionada = (option) => option.selected === true || option.selected === 'selected'

    //Dtm (DATA E HORA) CHEGA NO FORMATO DO LEGADO "dd/mm/aaaa - hh:mm"
    const dataHoraDoLegado = (valor) => {

        if (!valor || valor === '0000-00-00 00:00:00') return null

        const [data, hora] = valor.replace(' - ', ' ').split(' ')
        const [dia, mes, ano] = data.split('/')
        const [horas, minutos] = (hora || '').split(':')

        const parsedDate = new Date(`${ano}-${mes}-${dia}T${horas}:${minutos}:00Z`)

        return isNaN(parsedDate) ? undefined : parsedDate

    }

    //Dta CHEGA COMO "dd/mm/aaaa"; MEIO-DIA UTC PARA O FUSO NÃO TROCAR O DIA
    const dataDoLegado = (valor) => {

        if (!valor || valor === '00/00/0000') return undefined

        const [dia, mes, ano] = valor.split('/')
        const parsedDate = new Date(`${ano}-${mes}-${dia}T12:00:00Z`)

        return isNaN(parsedDate) ? undefined : parsedDate

    }

    const valorDoCampo = (field) => {

        const valor = field.field?.value || ''

        //Man/Ico NÃO RECEBEM value DA PONTE — O VALOR ATUAL VEM NO selected DAS OPTIONS.
        //SEM ISSO, ABRIR O "ALTERAR" E SALVAR SEM TOCAR APAGARIA O VALOR GRAVADO.
        if (!valor && Array.isArray(field.field?.options)) {
            return field.field.options.find(opcaoSelecionada)?.value ?? valor
        }

        return valor

    }

    //ESTADO INICIAL DOS CAMPOS DE UMA SEÇÃO A PARTIR DO QUE A PONTE MANDOU
    export const montaEstadoInicial = (secao) => {

        const estado = {}

        secao.fields.forEach((field) => {

            const fieldName = field.field?.name || field.name

            estado[fieldName] = valorDoCampo(field)

            if ((field.type === 'Frm' || field.type === 'Dtm') && (field.field?.class || '').includes('data-hora')) {
                const dataHora = dataHoraDoLegado(field.field?.value)
                if (dataHora !== undefined) estado[fieldName] = dataHora
            }

            if (field.type === 'Dta') {
                const data = dataDoLegado(field.field?.value)
                if (data !== undefined) estado[fieldName] = data
            }

            if (field.type === 'Ckb') {
                field.field.forEach((item) => {
                    if (!estado[item.name]) estado[item.name] = []
                    if (item.value && item.checked) estado[item.name].push(item.value)
                })
            }

            if (field.type === 'Rdo') {
                field.field.forEach((item) => {
                    if (item.checked) estado[item.name] = item.value || 0
                })
            }

            if (field.type === 'Cor') {
                estado[fieldName] = estado[fieldName] || '#aabbcc'
            }

        })

        return estado

    }
