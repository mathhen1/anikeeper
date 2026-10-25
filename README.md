# AniKeeper

AniKeeper é um aplicativo para descobrir animes e acompanhar a própria jornada: o usuário organiza títulos que concluiu, está assistindo ou planeja ver. O projeto tem um app mobile para Android e uma API que oferece contas oficiais e sincronização em nuvem.

## O aplicativo

O foco do projeto é o app mobile, feito com React Native, Expo e TypeScript. A interface oferece tema claro e escuro, navegação por abas, suporte a áreas seguras e orientação do dispositivo.

### O que já é possível fazer

- Explorar recomendações de animes por favoritos, avaliação e popularidade.
- Pesquisar animes pela Kitsu, abrir detalhes e adicioná-los às listas.
- Navegar e pesquisar a coleção, com paginação nas listas oficiais.
- Usar um perfil local no aparelho ou criar uma conta oficial para sincronizar com o servidor.
- Consultar resumos de coleção, gerenciar foto e username e exportar listas em TXT.

O modo local mantém suas listas e configurações no aparelho usando o Expo SQLite KV Store. O modo oficial usa o backend para autenticação, perfil e listas; o token fica no Expo SecureStore. Caches de exibição continuam no próprio dispositivo.

## Projetos

| Pasta | Conteúdo | Documentação |
| --- | --- | --- |
| [`mobile/`](mobile/) | Aplicativo Expo/React Native | [README mobile](mobile/README.md) |
| [`server/`](server/) | API REST Express e MongoDB | [README do servidor](server/README.md) |

## Início rápido

Cada projeto tem dependências e configuração próprias. Para rodar o app Android, configure o ambiente Android e siga o [guia mobile](mobile/README.md). Para usar contas oficiais, inicie também o servidor e configure o MongoDB Atlas conforme o [guia do servidor](server/README.md).

Resumo dos comandos:

```bash
# Terminal 1 — servidor
cd server
npm install
npm run dev

# Terminal 2 — app
cd mobile
npm install
npm run android
```

O app precisa de `EXPO_PUBLIC_API_URL` apontando para o endereço alcançável do servidor. Use `http://10.0.2.2:1414/api` no emulador Android padrão ou o IPv4 local do computador em um aparelho físico na mesma rede. Mais detalhes e configuração do banco estão nos READMEs específicos.

## Fontes de dados

A Kitsu API pública fornece pesquisa, detalhes e recomendações de animes. O backend guarda contas oficiais, listas e fotos no MongoDB. O app local não exige conta nem servidor para manter sua coleção no dispositivo.

## Estado do projeto

O projeto está em desenvolvimento. O app e a API já cobrem os principais fluxos de autenticação oficial, coleção, perfil, foto e exportação. Consulte a documentação de cada pasta para requisitos, endpoints, configuração e limitações atuais.
