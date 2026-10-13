    export const cleanUrl = (url) => {
        return url?.replace(/\/?index\.php/g, '') || ''
    }
    export const buildApiUrl = (searchParams, defaultSlug = '') => {
        const params = new URLSearchParams(searchParams)

        const pag = params.get('pag')
        const slug = params.get('slug')

        if (pag) {
            params.set('slug', pag)
            params.delete('pag')
        } else {
            params.set('slug', slug ?? defaultSlug)
        }

        if (
            params.get('slug') == null ||
            params.get('slug') == '' ||
            params.get('slug') == undefined
        ) {
            return false
        }

        const allowedParams = [
            'p',
            'setor',
            'qua',
            'qui',
            'sex',
            'slug',
            'acao',
            'id',
            'toggle-status',
            'busca',
            'filters',
            'limit',
            'pagina',
            'order-field',
            'order-direction',
            'inserir',
            'alterar',
            'cliente',
            'parametro',
            'parametros',
            'mes',
            'ano',
            'usuario',
            'start',
            'end',
        ]

        // Remove parâmetros não permitidos
        for (const param of [...params.keys()]) {
            if (!allowedParams.includes(param)) {
                params.delete(param)
            }
        }

        return `/panel/module?${params.toString()}`
    }

    // URL DA EXCLUSÃO EM LOTE A PARTIR DA PÁGINA ATUAL — MANTÉM OS PARÂMETROS DE CONTEXTO
    // (ex.: cliente, parametro, setor). SEM O cliente, O CARD DE MÓDULOS REDIRECIONA PARA
    // ?pag=clientes&erro=nenhum-cliente-selecionado E NÃO EXCLUI NADA.
    export const buildRemoveItemsUrl = () => {

        const params = new URLSearchParams(window.location.search)

        params.set('acao', 'remove-items')
        params.delete('id')
        params.delete('excluir')

        return buildApiUrl(params)

    }

    export const updateTablePagination = async (params) => {

        const url = new URL(window.location.href)

        url.searchParams.set('pagina', String(params.pageIndex + 1)) // Page is 1-indexed on server
        url.searchParams.set('limit', String(params.pageSize))
        if (params.sorting?.[0]?.id) {
            url.searchParams.set('order-field', params.sorting[0].id)
            url.searchParams.set(
                'order-direction',
                params.sorting[0].desc ? 'DESC' : 'ASC'
            )
        }

        // Column filters
        if (params.columnFilters) {
            params.columnFilters.forEach(({ id, value }) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(`filter[${id}]`, String(value)) // Properly serialize filter values
                }
            })
        }

        const apiUrl = buildApiUrl(url.searchParams.toString())

        return apiUrl
    }
