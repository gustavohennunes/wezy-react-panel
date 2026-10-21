import { cn } from '@/lib/utils'
import { cleanUrl } from '@/utils/urlHelper'
import { alvoDoLink, relDoAlvo } from '@/utils/alvoDoLink'
import { comChaves } from '@/utils/chavesUnicas'

//BOTÕES QUE O CARTÃO MANDA DEPOIS DAS ABAS (tabs.after) — OS MESMOS NO FORMULÁRIO (FormTabs) E NA LISTAGEM (Models)
const BotoesDasAbas = ({ botoes, className }) => {

    if (!Array.isArray(botoes)) return null

    return (
        <div className={cn('card-header justify-start flex-wrap gap-2 border-b-0', className)}>
            {comChaves(botoes, (botao) => `${botao.url || ''}|${botao.content}`).map(({ item: botao, chave }) => (
                <a
                    key={chave}
                    className="btn btn-primary"
                    href={!botao.url || botao.url === 'javascript:;' ? '' : cleanUrl(botao.url)}
                    target={alvoDoLink(botao.target)}
                    rel={relDoAlvo(botao.target)}
                >
                    {botao.content}
                </a>
            ))}
        </div>
    )

}

export { BotoesDasAbas }
