    // RECRIA O <script> PARA O NAVEGADOR EXECUTAR (SCRIPT VINDO DE innerHTML NÃO RODA)
    export const executarScript = (antigo) => new Promise((resolve) => {

        const novo = document.createElement('script')

        Array.from(antigo.attributes).forEach((attr) => novo.setAttribute(attr.name, attr.value))

        if (antigo.src) {
            novo.async = false
            novo.onload = () => resolve()
            novo.onerror = () => resolve()
        } else {
            novo.textContent = antigo.textContent
        }

        antigo.parentNode?.replaceChild(novo, antigo)

        if (!antigo.src) {
            resolve()
        }

    })

