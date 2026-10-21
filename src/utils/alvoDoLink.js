//ALVO DOS LINKS QUE A PONTE MANDA ($setIcone COM true, $setBotoes COM array): O PanelModule DEVOLVE O ATRIBUTO INTEIRO
//(target="_blank"), NÃO SÓ O VALOR. SEM TIRAR O ENVOLTÓRIO O <a> SAÍA COM target="target=&quot;_blank&quot;"
export const alvoDoLink = (target) => {
    const valor = String(target || '').trim()
    return /^target\s*=\s*["']?([^"']*)["']?$/i.exec(valor)?.[1] || valor || '_self'
}

export const relDoAlvo = (target) => (alvoDoLink(target) === '_blank' ? 'noopener noreferrer' : undefined)
