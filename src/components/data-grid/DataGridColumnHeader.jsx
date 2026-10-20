import { cn } from '@/lib/utils'

// TÍTULO DA COLUNA DO GRID. AS LISTAGENS DO PAINEL NÃO ORDENAM NEM ESCONDEM COLUNA PELO CABEÇALHO (A ORDEM VEM DA PONTE
// E A REORDENAÇÃO É POR ARRASTAR A LINHA), ENTÃO O CABEÇALHO É SÓ O TEXTO
export function DataGridColumnHeader({ title = '', className }) {
    return <div className={cn(className)}>{title}</div>
}
