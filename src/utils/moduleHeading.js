/**
 * TÍTULO E CAMINHO DE MIGALHAS DOS SUBMÓDULOS
 *
 * A ponte panel/module (PanelModule.php) resolve o nome do módulo lendo quatro
 * arrays de menu, mas só carrega dois deles:
 *
 *     $modulosSubSistemas = $moduleContent['submodules_system'];
 *     $modulosSistemas    = $moduleContent['modules_system'];
 *
 * Os outros dois — $subModulosSistemas e $subModulosSubSistemas, que no painel-php
 * são montados em controles/menus.php — nunca chegam a existir na API. Módulo raiz
 * acha o nome em $modulosSistemas e funciona; SUBMÓDULO cai no else, lê um array
 * indefinido e volta com o nome vazio. O resultado é params.title = '' e um
 * breadcrumb com o link do módulo sem texto:
 *
 *     <a href="index.php" class="preto">Início</a> > <a href="index.php?pag=x" class="preto"></a>
 *
 * Como o painel-php é somente leitura, o nome é recuperado aqui pela árvore do
 * panel/menus, que já traz todos os submódulos em children[].
 */

//JUNTA OS MENUS PRINCIPAL E DO USUÁRIO, ACEITANDO AS DUAS FORMAS DO CONFIG
const raizesDoMenu = (menuConfig) => [
    ...(menuConfig?.structure?.main || menuConfig?.main || []),
    ...(menuConfig?.structure?.user || menuConfig?.user || []),
]

/**
 * Devolve o caminho do topo até o módulo: [pai, item] para submódulo, [item] para raiz
 * e [] quando o slug não está no menu (módulo interno, sem permissão, etc).
 */
const findMenuTrail = (menuConfig, slug) => {

    if (!slug) return []

    const alvo = `?pag=${slug}`

    for (const item of raizesDoMenu(menuConfig)) {

        if (item?.path === alvo) return [item]

        const filhos = Array.isArray(item?.children) ? item.children : []
        for (const filho of filhos) {
            if (filho?.path === alvo) return [item, filho]
        }

    }

    return []

}

//NOME DO MÓDULO SEGUNDO O MENU (VEM TRUNCADO EM 24 CARACTERES PELO PanelMenus)
const nomeDoMenu = (menuConfig, slug) => {
    const trail = findMenuTrail(menuConfig, slug)
    return trail.length > 0 ? trail[trail.length - 1]?.title || '' : ''
}

//MANTÉM O TÍTULO DA API; SÓ USA O MENU QUANDO ELE VOLTOU VAZIO
const resolveModuleTitle = (title, menuConfig, slug) => {

    if (typeof title === 'string' && title.trim() !== '') return title

    return nomeDoMenu(menuConfig, slug)

}

/**
 * Preenche o <a> vazio deixado pela ponte. Não reescreve o breadcrumb inteiro:
 * CARDs podem definir $novoCaminho próprio, e esse vem completo — nesse caso não
 * há âncora vazia e a string volta intacta.
 */
const resolveModuleBreadcrumbs = (breadcrumbs, menuConfig, slug, acao = '') => {

    const nome = nomeDoMenu(menuConfig, slug)

    if (typeof breadcrumbs === 'string' && breadcrumbs.trim() !== '') {

        if (!nome) return breadcrumbs

        //TROCA A PRIMEIRA ÂNCORA SEM TEXTO PELO NOME DO MÓDULO
        return breadcrumbs.replace(/(<a\b[^>]*>)(\s*)(<\/a>)/i, `$1${nome}$3`)

    }

    //SEM BREADCRUMB NENHUM: REMONTA O PADRÃO DO PanelModule.php
    if (!nome) return ''

    let caminho = `<a href="index.php" class="preto">Início</a> > <a href="index.php?pag=${slug}" class="preto">${nome}</a>`

    if (acao) {
        caminho += ` > <a href="javascript:void(0);" class="preto">${acao}</a>`
    }

    return caminho

}

export { findMenuTrail, resolveModuleTitle, resolveModuleBreadcrumbs }
