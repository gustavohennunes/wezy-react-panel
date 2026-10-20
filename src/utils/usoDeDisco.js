    // USO DE DISCO DO CLIENTE QUE O panel/menus MANDA EM usage ({ used: '1.3GB', plan: '5GB' }) — RODAPÉ DA SIDEBAR E DASHBOARD

    const UNIDADES = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }

    //"1.3GB" / "500 MB" / "1,3 GB" → BYTES (null QUANDO NÃO DÁ PARA LER: AÍ SÓ O TEXTO APARECE, SEM A BARRA)
    const emBytes = (texto) => {
        const partes = /([\d.,]+)\s*(B|KB|MB|GB|TB)\b/i.exec(String(texto ?? ''))
        if (!partes) return null
        const numero = parseFloat(partes[1].replace(',', '.'))
        return Number.isFinite(numero) ? numero * UNIDADES[partes[2].toUpperCase()] : null
    }

    //"1.3GB" → "1,3 GB"
    export const tamanhoLegivel = (texto) =>
        String(texto ?? '')
            .replace(/(\d)\.(\d)/, '$1,$2')
            .replace(/(\d)\s*(B|KB|MB|GB|TB)\b/i, '$1 $2')

    //AMARELO A PARTIR DE 75% E VERMELHO A PARTIR DE 90%: O AVISO VAI TAMBÉM NO TEXTO, NÃO SÓ NA COR
    const nivelDoUso = (percentual) => {
        if (percentual === null) return 'normal'
        if (percentual >= 90) return 'critico'
        if (percentual >= 75) return 'alerta'
        return 'normal'
    }

    //CLASSES DO METRONIC (.progress-*, .text-*) E O AVISO DE CADA NÍVEL
    const VISUAL_DO_NIVEL = {
        normal:  { barra: 'progress-primary', texto: 'text-gray-600', aviso: '' },
        alerta:  { barra: 'progress-warning', texto: 'text-warning', aviso: 'atenção ao espaço' },
        critico: { barra: 'progress-danger', texto: 'text-danger', aviso: 'quase cheio' },
    }

    //percentual null = NÃO DEU PARA CALCULAR (SEM BARRA)
    export const lerUsoDeDisco = (uso) => {
        const usado      = emBytes(uso.used)
        const plano      = emBytes(uso.plan)
        const percentual = usado !== null && plano ? Math.min(100, Math.round((usado * 100) / plano)) : null
        const nivel      = nivelDoUso(percentual)
        return { percentual, nivel, ...VISUAL_DO_NIVEL[nivel] }
    }
