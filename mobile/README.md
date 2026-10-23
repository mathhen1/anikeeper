# AniKeeper

**Organize sua jornada pelos animes em um só lugar.**

AniKeeper é um aplicativo mobile para descobrir animes e manter uma coleção pessoal organizada. O protótipo é desenvolvido com React Native, Expo e TypeScript, com foco atual em Android.

## O que o app oferece

- **Início:** recomendações da Kitsu separadas em favoritos, mais bem avaliados e mais populares, com até oito títulos por seção.
- **Minha lista:** coleção dividida em animes concluídos, assistindo atualmente e planejo assistir. É possível pesquisar localmente na lista selecionada.
- **Adicionar anime:** pesquisa por nome na Kitsu, com histórico de títulos consultados.
- **Detalhes do anime:** informações do título e ações para adicioná-lo a uma das três listas ou removê-lo da coleção.
- **Perfil:** resumo da coleção, tema claro ou escuro, foto de perfil, exportação dos dados locais e opções de gerenciamento do perfil.

## Estado atual do projeto

O modo local está funcional para organizar a coleção neste dispositivo. As listas, o nome do perfil e as preferências locais são mantidos no armazenamento do aparelho. As listas são associadas ao username local, permitindo alternar entre perfis locais.

A criação de uma conta oficial e o login oficial ainda são protótipos. O projeto não possui backend nem sincronização em nuvem; essas telas não representam autenticação real.

## Tecnologias

- React Native e Expo
- Expo Router para navegação por arquivos, grupos de rotas públicas e protegidas
- TypeScript
- AsyncStorage para dados locais
- Expo FileSystem para arquivos e caches locais
- Expo ImagePicker para escolher a foto de perfil
- Expo Screen Orientation e React Native Safe Area Context para orientação e áreas seguras
- Kitsu API para pesquisa e recomendações de animes

## Requisitos

- Node.js e npm
- Android Studio com Android SDK e um emulador configurado, ou um dispositivo Android
- Expo Go para executar no dispositivo, quando compatível com as dependências nativas utilizadas

## Instalação e execução

No terminal, entre na pasta `mobile` e instale as dependências:

```bash
cd mobile
npm install
```

Inicie o projeto no Android:

```bash
npm run android
```

Para iniciar o servidor do Expo sem abrir automaticamente o Android:

```bash
npm start
```

O Android SDK precisa estar instalado e configurado para executar no emulador. Também é possível abrir o projeto em um dispositivo Android pelo Expo Go, respeitando a compatibilidade das bibliotecas nativas instaladas.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento Expo. |
| `npm run android` | Inicia o Expo e abre o projeto no Android. |
| `npm run ios` | Inicia o projeto no simulador iOS, quando disponível. |
| `npm run web` | Inicia a versão web do Expo. |
| `npm run typecheck` | Executa a verificação de tipos do TypeScript. |

## Navegação

As rotas estão organizadas pelo Expo Router em `app/`:

| Grupo | Rotas | Acesso |
| --- | --- | --- |
| `(public)` | Boas-vindas, login, login local e cadastro | Usuários sem sessão |
| `(main)` | Início, minha lista, adicionar anime, perfil e detalhes do anime | Usuários autenticados no app |

O layout raiz inicializa os provedores de tema, autenticação, área segura e orientação. O grupo `(main)` verifica a sessão antes de exibir as telas principais.

## Dados locais e privacidade

- As listas são salvas no AsyncStorage e separadas pelo username local.
- A foto de perfil local é escolhida na galeria após a solicitação de permissão e armazenada no dispositivo.
- O perfil permite exportar os dados locais em um arquivo JSON.
- As opções de gerenciamento permitem renomear o perfil local, limpar suas listas ou excluir o perfil e seus dados associados.
- A opção de apagar todos os dados do dispositivo fica disponível na entrada do modo local.
- Os caches de estatísticas e contagens evitam recalcular os resumos a cada navegação.

## API de animes

O AniKeeper consulta a Kitsu API em https://kitsu.io/api/edge sem chave de API. A tela de pesquisa consulta títulos por nome e a tela inicial apresenta listas recomendadas ordenadas por favoritos, avaliação e popularidade. A disponibilidade das consultas depende da conexão com a internet e do serviço da Kitsu.

## Estrutura do projeto

```text
mobile/
|-- app/
|   |-- (public)/       # Boas-vindas e acesso
|   |-- (main)/         # Área principal autenticada
|   `-- _layout.tsx     # Provedores e navegação raiz
|-- src/
|   |-- auth/           # Estado da sessão
|   |-- components/     # Componentes reutilizáveis
|   |-- data/           # Integração com Kitsu e exportação
|   |   `-- cache/      # Persistência e caches locais
|   |-- orientation/    # Estado da orientação do dispositivo
|   |-- theme/          # Tema claro e escuro
|   `-- types/          # Tipos compartilhados
|-- app.json
|-- package.json
`-- tsconfig.json
```

## Próximos passos

O projeto está sendo construído gradualmente. A integração de contas oficiais, backend e sincronização entre dispositivos ainda será definida e implementada.
