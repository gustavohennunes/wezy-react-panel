    //BASE64 DE UM TEXTO UTF-8 (O btoa SOZINHO SÓ ACEITA latin1). EM BLOCOS PARA NÃO ESTOURAR A PILHA
    //COM TEXTO GRANDE NO String.fromCharCode
    export const utf8ParaBase64 = (texto) => {
        const bytes = new TextEncoder().encode(texto)
        let binario = ''
        for (let i = 0; i < bytes.length; i += 0x8000) {
            binario += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
        }
        return btoa(binario)
    }
