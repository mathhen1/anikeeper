# AniKeeper Mobile

Aplicativo Android para descobrir animes e organizar uma coleção pessoal. O app é feito com React Native, Expo e TypeScript, usando o Expo Router para navegação.

## Funcionalidades

- **Início:** recomendações da Kitsu por favoritos, avaliação e popularidade; cada faixa começa com oito títulos e permite carregar mais resultados.
- **Minha lista:** listas de animes concluídos, assistindo atualmente e planejados, com busca e paginação.
- **Adicionar anime:** busca de títulos na Kitsu e histórico de pesquisas.
- **Detalhes do anime:** informações do título e ações para adicionar a uma lista ou removê-lo da coleção.
- **Perfil:** estatísticas aproximadas, foto, tema claro/escuro, exportação das listas e gerenciamento da conta.
- **Conta local:** mantém listas, username e foto no dispositivo, separados por username.
- **Conta oficial:** autenticação com o backend AniKeeper e sincronização de listas, perfil e foto com o servidor.

## Tecnologias

- Expo SDK 58, React Native 0.88 e React 19
- TypeScript e Expo Router
- Expo SQLite KV Store para persistência local
- Expo SecureStore para o token JWT de contas oficiais
- Expo FileSystem para cache local de estatísticas e fotos
- Expo ImagePicker, Expo Screen Orientation e React Native Safe Area Context
- Kitsu API para pesquisa, detalhes e recomendações de animes

## Requisitos

- Node.js 24.22.1 ou superior e npm
- Android Studio com Android SDK e emulador configurado, ou dispositivo Android
- Expo Go compatível com o SDK do projeto; para dependências nativas incompatíveis com Expo Go, use um development build
- Backend AniKeeper em execução para cadastro, login e recursos de contas oficiais

## Instalação e execução

```bash
cd mobile
npm install
```

Configure a URL do backend usando o arquivo de exemplo:

```bash
cp .env.example .env
```

O `.env.example` usa `http://10.0.2.2:1414/api`, endereço do computador anfitrião visto pelo emulador Android padrão. Em dispositivo físico, use o IPv4 local do computador que executa o servidor, por exemplo `http://192.168.0.25:1414/api`. O celular e o computador precisam estar na mesma rede, e o firewall deve permitir conexões na porta do servidor.

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:1414/api
```

Depois de alterar variáveis `EXPO_PUBLIC_`, reinicie o Expo. Inicie o app com:

```bash
npm run android
```

Ou inicie o servidor do Expo e abra o projeto pelo Expo Go:

```bash
npm start
```

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento do Expo. |
| `npm run android` | Inicia o Expo e tenta abrir o app no Android. |
| `npm run ios` | Inicia o app no simulador iOS, se disponível. |
| `npm run web` | Inicia a versão web do Expo. |
| `npm run typecheck` | Verifica os tipos TypeScript sem gerar arquivos. |

## Navegação e autenticação

As rotas estão em `app/` e são organizadas pelo Expo Router:

| Grupo | Conteúdo | Acesso |
| --- | --- | --- |
| `(public)` | Boas-vindas, cadastro oficial, login oficial e entrada local | Sem sessão ativa |
| `(main)` | Início, minha lista, pesquisa, perfil e detalhes de anime | Sessão ativa |

O `AuthContext` distingue sessões locais e oficiais. O token oficial é salvo no SecureStore e carregado para a memória durante a execução. Chamadas autenticadas usam `EXPO_PUBLIC_API_URL`; respostas 401 encerram a sessão e pedem nova autenticação.

## Armazenamento

- As listas e preferências locais usam o SQLite KV Store do Expo e ficam separadas pelo username local.
- A foto local é selecionada pela galeria após solicitação de permissão.
- Caches de contagens, estatísticas e fotos são mantidos no dispositivo com Expo FileSystem.
- Contas oficiais buscam e alteram os dados remotos no backend; os caches visuais continuam locais e identificados pelo ID da conta.
- A exportação cria um arquivo TXT com os nomes dos animes das listas. Para contas oficiais, o conteúdo vem do backend.
- O app oferece ações para limpar listas ou apagar a conta, respeitando o tipo de sessão.

## API de animes

Pesquisa, detalhes e recomendações usam a API pública da Kitsu em `https://kitsu.io/api/edge`, sem chave de API. O backend recebe as informações de anime selecionadas pelo usuário e as associa às listas da conta oficial. A busca e recomendações dependem de conexão com a internet e disponibilidade da Kitsu.

## Estrutura

```text
mobile/
├── app/                 # Rotas públicas e área principal autenticada
├── src/auth/            # Estado de autenticação e token de sessão
├── src/components/      # Componentes compartilhados
├── src/data/            # Kitsu, API oficial, exportação e caches
├── src/orientation/     # Estado de orientação do dispositivo
├── src/theme/           # Temas claro e escuro
└── src/types/           # Tipos compartilhados
```

Consulte o [README geral](../README.md) para a visão do projeto completo e o [README do servidor](../server/README.md) para configurar a API.
