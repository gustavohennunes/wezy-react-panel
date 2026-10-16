// yarn deploy — BUILD DE PRODUÇÃO E ENVIO POR FTP PARA O app.wezy.com.br
//
// - O BUILD VAI PARA UMA PASTA TEMPORÁRIA, NÃO PARA O dist/: O dist É DO yarn build:watch (SEM MINIFICAR E COM OS
//   ARQUIVOS ANTIGOS ACUMULADOS) E UM BUILD NELE CONCORRERIA COM O WATCHER
// - CREDENCIAIS DO .vscode/sftp.json (NO .gitignore — A SENHA NÃO VAI PARA O GIT NEM PARA O BUNDLE)
// - ORDEM DO ENVIO: assets/ E media/ PRIMEIRO, index.html E .htaccess POR ÚLTIMO — QUEM ABRIR O SITE NO MEIO DO
//   DEPLOY CONTINUA NO index.html ANTERIOR, QUE APONTA PARA ASSETS QUE AINDA EXISTEM
// - SÓ SOBE O QUE MUDOU (MESMO NOME E TAMANHO NO SERVIDOR = PULA) E RECONECTA SE O FTP CAIR NO MEIO
// - NO FIM, APAGA DO SERVIDOR OS assets/ QUE NÃO SÃO DESTE BUILD (HASH ANTIGO)
//
// --sem-build: SÓ ENVIA O ÚLTIMO BUILD DA PASTA TEMPORÁRIA

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'basic-ftp'

const raiz   = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const saida  = join(tmpdir(), 'wezy-react-panel-deploy')
const config = join(raiz, '.vscode', 'sftp.json')

const semBuild = process.argv.includes('--sem-build')

if (!existsSync(config)) {
    console.error('Faltou o .vscode/sftp.json com host, username, password e remotePath do FTP.')
    process.exit(1)
}

const ftpConfig = JSON.parse(readFileSync(config, 'utf-8'))
const remoto    = (ftpConfig.remotePath || '/').replace(/\/+$/, '') || ''

// ----- BUILD -----

if (!semBuild) {

    rmSync(saida, { recursive: true, force: true })

    console.log('Build de produção em', saida)

    //vite PELO PRÓPRIO node (SEM shell: O npx NO WINDOWS PRECISARIA DE shell, QUE NÃO ESCAPA OS ARGUMENTOS)
    const build = spawnSync(process.execPath, [join(raiz, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--outDir', saida, '--emptyOutDir', '--logLevel', 'warn'], {
        cwd: raiz,
        stdio: 'inherit',
    })

    if (build.status !== 0) {
        console.error('Build falhou, nada foi enviado.')
        process.exit(build.status || 1)
    }

}

if (!existsSync(join(saida, 'index.html'))) {
    console.error('Não há build em', saida, '— rode sem --sem-build.')
    process.exit(1)
}

copyFileSync(join(raiz, 'scripts', 'deploy', '.htaccess'), join(saida, '.htaccess'))

// ----- ENVIO -----

const cliente = new Client(60000)

const conectar = async () => {
    cliente.close()
    await cliente.access({
        host: ftpConfig.host,
        port: ftpConfig.port || 21,
        user: ftpConfig.username,
        password: ftpConfig.password,
        secure: ftpConfig.protocol === 'ftps',
    })
}

//O SERVIDOR DERRUBA CONEXÕES DE VEZ EM QUANDO (ETIMEDOUT NO MODO PASSIVO): RECONECTA E TENTA DE NOVO O MESMO PASSO
const comRetentativa = async (descricao, passo) => {
    for (let tentativa = 1; ; tentativa++) {
        try {
            return await passo()
        } catch (erro) {
            if (tentativa >= 5) throw new Error(`${descricao}: ${erro.message}`)
            console.warn(`  ${descricao} falhou (${erro.message}), reconectando... (${tentativa}/4)`)
            await new Promise((ok) => setTimeout(ok, 3000 * tentativa))
            await conectar().catch(() => {})
        }
    }
}

//ARQUIVOS DO BUILD COMO CAMINHOS RELATIVOS ("assets/index-x.js", "media/...")
const listarLocal = (pasta, prefixo = '') =>
    readdirSync(join(saida, pasta), { withFileTypes: true }).flatMap((item) => {
        const relativo = prefixo + item.name
        return item.isDirectory() ? listarLocal(join(pasta, item.name), relativo + '/') : [relativo]
    })

//TAMANHOS NO SERVIDOR, POR PASTA (O MESMO ARQUIVO COM O MESMO TAMANHO NÃO É REENVIADO: media/ NÃO MUDA E OS
//assets TÊM HASH NO NOME — SÓ O QUE MUDOU SOBE)
const remotosPorPasta = new Map()
const tamanhoRemoto = async (relativo) => {
    const pasta = relativo.includes('/') ? relativo.slice(0, relativo.lastIndexOf('/')) : ''
    if (!remotosPorPasta.has(pasta)) {
        const itens = await comRetentativa(`listar ${pasta || '/'}`, () => cliente.list(`${remoto}/${pasta}`)).catch(() => [])
        remotosPorPasta.set(pasta, new Map(itens.filter((item) => item.isFile).map((item) => [item.name, item.size])))
    }
    return remotosPorPasta.get(pasta).get(relativo.slice(relativo.lastIndexOf('/') + 1))
}

try {

    await conectar()

    const pastas = readdirSync(saida, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name)
    const arquivos = pastas.flatMap((pasta) => listarLocal(pasta, pasta + '/'))

    //ARQUIVOS SOLTOS (vite.svg...) E POR ÚLTIMO .htaccess E index.html: QUEM ABRIR O SITE NO MEIO DO DEPLOY CONTINUA
    //NO index.html ANTERIOR, QUE APONTA PARA ASSETS QUE AINDA EXISTEM
    const soltos = readdirSync(saida, { withFileTypes: true })
        .filter((item) => item.isFile())
        .map((item) => item.name)
        .sort((a, b) => (a === 'index.html') - (b === 'index.html') || (a === '.htaccess') - (b === '.htaccess'))

    let enviados = 0
    let iguais   = 0
    const pastasCriadas = new Set()

    for (const relativo of arquivos) {

        const local = join(saida, relativo)
        if ((await tamanhoRemoto(relativo)) === statSync(local).size) {
            iguais++
            continue
        }

        const pasta = relativo.slice(0, relativo.lastIndexOf('/'))
        if (!pastasCriadas.has(pasta)) {
            await comRetentativa(`criar ${pasta}`, async () => {
                await cliente.ensureDir(`${remoto}/${pasta}`)
                await cliente.cd('/')
            })
            pastasCriadas.add(pasta)
        }

        await comRetentativa(relativo, () => cliente.uploadFrom(local, `${remoto}/${relativo}`))
        enviados++
        console.log(`  ${relativo}`)

    }

    //index.html E .htaccess SEMPRE SOBEM (O index.html APONTA PARA OS ASSETS NOVOS)
    for (const nome of soltos) {
        await comRetentativa(nome, () => cliente.uploadFrom(join(saida, nome), `${remoto}/${nome}`))
        enviados++
    }

    //LIMPA OS assets/ DE BUILDS ANTERIORES
    const atuais  = new Set(readdirSync(join(saida, 'assets')))
    const antigos = (await comRetentativa('listar assets', () => cliente.list(`${remoto}/assets`))).filter((item) => item.isFile && !atuais.has(item.name))

    for (const item of antigos) {
        await comRetentativa(`remover assets/${item.name}`, () => cliente.remove(`${remoto}/assets/${item.name}`))
    }

    console.log(`Deploy concluído: ${enviados} enviados, ${iguais} já iguais no servidor, ${antigos.length} assets antigos removidos.`)

} catch (erro) {

    console.error('Falha no deploy:', erro.message)
    process.exitCode = 1

} finally {

    cliente.close()

}
