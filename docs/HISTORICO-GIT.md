# Histórico do Git — saneamento de 07/11/2026

Autorizado pelo proprietário: reescrita do histórico **somente** do repositório ativo `Jorgealam/bhadott`
para retirar definitivamente marcas e nomes de terceiros que não fazem parte do Portal BHADOTT.
Nenhum outro repositório foi alterado (o antigo `bhadott-studio` e o servidor ASP.NET ficaram intactos).

## O que foi retirado

- Dois arquivos de logo de terceiros em `games/img/partners/` (removidos de **todos** os commits).
- Menções a marcas, endereços e integrantes de terceiros no conteúdo dos arquivos de todos os commits
  (substituídas por "Universo BHADOTT", "terceiros" ou "integrante").
- Menções nas mensagens de commit (ex.: "remoção de marcas de terceiros").
- O importador do Bhadott Games passou a usar uma **regra genérica** (sem citar nomes):
  nenhum parceiro, equipe só com o fundador e uma trava que impede links para domínios externos.

As regras de substituição usadas ficaram **fora** do repositório (contêm os nomes), junto com o backup.

## Backup do histórico original (antes da reescrita)

`D:\TRABALHO\BACKUPS\bhadott-historico-original-2026-11-07\`

| Arquivo | Conteúdo | Verificação |
|---|---|---|
| `bhadott-github.git` | Espelho completo do GitHub (todas as branches/tags, 15 commits, `main` = `701f45c`) | `git fsck --full` sem erros |
| `bhadott-local-completo.bundle` | Repositório local completo (16 commits, incluindo o commit ainda não publicado) | `git bundle verify` → *is okay* |

Para restaurar (só em emergência): `git clone bhadott-local-completo.bundle bhadott-restaurado`.

## Como foi feito

1. Commit local das alterações pendentes.
2. Backup espelho + bundle e verificação de integridade.
3. Clone separado em `D:\BHADOTT_IA\Temporarios\bhadott-reescrita\repo`.
4. `git-filter-repo` 2.47.0 (executado via `uvx`, caches em `D:\BHADOTT_IA\Cache`) com
   `--replace-text`, `--replace-message` e `--path games/img/partners/ --invert-paths`.
5. Verificação antes de publicar:
   - 0 menções no conteúdo de todo o histórico, 0 nas mensagens, 0 arquivos de logo;
   - árvore de arquivos atual **idêntica** à original (`9b00a433…`) — nenhum código legítimo alterado;
   - 16 commits preservados; `git fsck` sem erros; build + 58 páginas testadas.
6. Publicação controlada: `git push --force-with-lease=main:701f45c` (só substitui se o GitHub ainda estiver no estado do backup).
7. Pasta de trabalho sincronizada (`git reset --hard origin/main`) e objetos antigos apagados localmente (`reflog expire` + `gc --prune=now`).

**Novo `main`:** `1a4d484` (antes: `701f45c`). Todos os códigos (SHA) dos commits mudaram.

## Como sincronizar outros clones

Qualquer outra cópia do repositório (outro computador, outra pasta, outra sessão) ainda tem o histórico antigo.
**Não use `git pull`** nela — isso traria o histórico antigo de volta. Faça:

```bash
git fetch origin
git status            # se houver alterações locais, salve antes (git stash ou cópia da pasta)
git reset --hard origin/main
git reflog expire --expire=now --all
git gc --prune=now
```

Ou simplesmente apague a cópia antiga e clone de novo: `git clone https://github.com/Jorgealam/bhadott.git`.

## O que ainda depende do GitHub

- **Commits antigos pelo SHA direto** (ex.: `/commit/701f45c`) continuam acessíveis no cache do GitHub, embora não
  estejam em nenhuma branch. Para apagá-los de vez: formulário do GitHub Support → *"Remove sensitive data / cached views"*,
  informando o repositório `Jorgealam/bhadott` e os SHAs antigos (lista no backup: `git -C bhadott-github.git log --format=%H`).
- **Execuções antigas do GitHub Actions** podem exibir as mensagens antigas no título; podem ser apagadas em
  *Actions → (execução) → Delete workflow run*.
