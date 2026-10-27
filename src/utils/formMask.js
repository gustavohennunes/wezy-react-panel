export const resolveFormMask = (mask, fieldName) => {
    // Telefone aceita fixo e celular; o IMask escolhe pelo total de dígitos.
    // O WhatsApp continua usando a máscara recebida da API.
    if (fieldName === 'FrmTelefone') {
        return [
            { mask: '(00) 0000-0000' },
            { mask: '(00) 00000-0000' },
        ]
    }

    //Site NÃO É PADRÃO DO IMask: O FormInput FORMATA NO onChange (VER formatarSite)
    if (mask === 'Site') return undefined

    return mask === 'Number' ? Number : mask
}

// MÁSCARA Site DO LEGADO (jscripts/mascaras.js): O ENDEREÇO SEMPRE COMEÇA COM "https://". DIGITAR "h" VIRA "https://h";
// COLAR "http://site.com" OU "https://site.com" FICA "https://site.com"; APAGAR TUDO DEIXA O CAMPO VAZIO
export const formatarSite = (valor) => {
    const semProtocolo = String(valor ?? '').trim().replace(/^(https?:\/{0,2})+/i, '')
    return semProtocolo === '' ? '' : 'https://' + semProtocolo
}

// TELEFONE FIXO (8 DÍGITOS) OU CELULAR/WHATSAPP (9) COM DDD, PARA TEXTO LIVRE FORA DO IMask (ex.: TAGS DO Mul COM
// mascara-telefone): "11987654321" VIRA "(11) 98765-4321", "1134567890" VIRA "(11) 3456-7890". DIGITANDO, FORMATA O PARCIAL
export const formatarTelefone = (valor) => {
    const digitos = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
    if (digitos.length === 0) return ''
    if (digitos.length <= 2) return `(${digitos}`
    const ddd    = digitos.slice(0, 2)
    const numero = digitos.slice(2)
    const corte  = digitos.length === 11 ? 5 : 4
    return numero.length <= corte ? `(${ddd}) ${numero}` : `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
}

// TELEFONE COMPLETO: DDD + 8 (FIXO) OU 9 (CELULAR) DÍGITOS
export const telefoneCompleto = (valor) => [10, 11].includes(String(valor ?? '').replace(/\D/g, '').length)
