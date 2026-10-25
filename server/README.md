# AniKeeper Server

API REST do AniKeeper, desenvolvida com Express, TypeScript e MongoDB/Mongoose. Ela fornece autenticação oficial, armazenamento remoto das listas, gerenciamento de perfil e integração com o app mobile.

## Requisitos

- Node.js 24.22.1 ou superior e npm
- MongoDB Atlas (ou uma instância MongoDB acessível)
- Uma database e um usuário de banco configurados no Atlas
- Acesso de rede do servidor ao cluster; configure a IP Access List no Atlas para o ambiente em que a API será executada

## Configuração

```bash
cd server
npm install
```

Copie `.env.example` para `.env` e configure os valores:

```env
PORT=1414
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/anikeeper?retryWrites=true&w=majority
JWT_SECRET=<segredo-aleatorio-com-pelo-menos-32-caracteres>
```

O `.env.example` contém uma URI local para desenvolvimento. Para usar MongoDB Atlas, substitua `MONGODB_URI` pela connection string fornecida pelo Atlas. Codifique caracteres especiais da senha na URI. Não versione o arquivo `.env` nem compartilhe o segredo JWT.

## Executar

Modo de desenvolvimento com reinício automático:

```bash
npm run dev
```

Verificação de tipos e build:

```bash
npm run typecheck
npm run build
npm start
```

O servidor conecta ao MongoDB antes de começar a ouvir requisições. A API usa a porta `1414` por padrão; ajuste `PORT` se necessário. A rota `GET /` responde com uma mensagem simples de disponibilidade.

## Integração com o mobile

O app deve apontar `EXPO_PUBLIC_API_URL` para a URL acessível do servidor, terminando em `/api`:

```env
# Emulador Android padrão
EXPO_PUBLIC_API_URL=http://10.0.2.2:1414/api

# Exemplo em aparelho físico na mesma rede Wi-Fi
EXPO_PUBLIC_API_URL=http://192.168.0.25:1414/api
```

`10.0.2.2` é o alias do Android Emulator para o computador anfitrião; não funciona como endereço de um celular físico. Para aparelho físico, use o IPv4 da máquina que executa o servidor, mantenha ambos na mesma rede e libere a porta no firewall. Em produção, exponha a API por HTTPS.

O app envia `Authorization: Bearer <accessToken>` às rotas protegidas. Cadastro e login retornam um JWT de acesso com validade de sete dias. O mobile o guarda com Expo SecureStore.

## Endpoints

Todas as rotas abaixo usam o prefixo `/api`. Rotas de usuário e listas exigem o header `Authorization: Bearer <token>`.

### Autenticação

| Método | Caminho | Uso |
| --- | --- | --- |
| `POST` | `/auth/register` | Cria conta e as três listas vazias; retorna token e usuário. |
| `POST` | `/auth/login` | Valida username e senha; retorna token e usuário. |

Exemplo de corpo para cadastro ou login:

```json
{
  "username": "matheus",
  "password": "senha-com-8-ou-mais"
}
```

O username tem de 3 a 20 caracteres e é normalizado para minúsculas. A senha tem de 8 a 64 caracteres. Senhas são armazenadas com bcrypt, nunca em texto puro.

Resposta de sucesso (`201` no cadastro, `200` no login):

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "<user-id>",
    "username": "matheus"
  }
}
```

### Perfil e dados da conta

| Método | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/users/me` | Perfil, indicador de foto e contagem das listas. |
| `PATCH` | `/users/me` | Atualiza username; corpo `{ "username": "novo-nome" }`. |
| `DELETE` | `/users/me` | Exclui conta e listas associadas. |
| `GET` | `/users/me/stats` | Estatísticas dos animes concluídos. |
| `DELETE` | `/users/me/anime-lists` | Limpa os animes de todas as listas da conta. |
| `GET` | `/users/me/anime-lists/export` | Baixa um TXT com os nomes dos animes por lista. |
| `GET` | `/users/me/profile-photo` | Retorna a foto armazenada como imagem WebP. |
| `PUT` | `/users/me/profile-photo` | Envia foto em multipart, campo `photo`. |
| `DELETE` | `/users/me/profile-photo` | Remove a foto de perfil. |

O upload aceita imagens de até 5 MB. O servidor valida e redimensiona a imagem com Sharp, converte para WebP e armazena o buffer e o content type no documento do usuário.

### Listas de animes

As chaves de lista aceitas são `completed`, `watching` e `planned`.

| Método | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/anime-lists/counts` | Retorna a quantidade de animes por lista. |
| `GET` | `/anime-lists/:key/animes?page=1&limit=20&q=naruto` | Lista animes com paginação e busca opcional por título. Limite máximo: 100. |
| `POST` | `/anime-lists/:key/animes` | Adiciona ou move anime para a lista informada. |
| `GET` | `/anime-lists/animes/:kitsuId` | Informa em qual lista o anime está ou retorna `null`. |
| `DELETE` | `/anime-lists/animes/:kitsuId` | Remove o anime de todas as listas do usuário. |
| `DELETE` | `/anime-lists/:key/animes` | Limpa uma lista específica. |

O `POST` aceita o recurso Kitsu selecionado pelo mobile, com `id` e `attributes` contendo títulos, episódios, avaliação, data, imagem e sinopse. Exemplo reduzido:

```json
{
  "id": "1",
  "attributes": {
    "canonicalTitle": "Cowboy Bebop",
    "subtype": "TV",
    "episodeCount": 26,
    "episodeLength": 24,
    "averageRating": "85.4"
  }
}
```

Anime é armazenado uma vez por ID Kitsu e referenciado pela lista do usuário. Ao movê-lo para outra lista, ele é removido das demais listas desse usuário.

## Respostas e segurança

- A API valida entradas com Zod e centraliza respostas de erro em `{ "error": "..." }`; erros de validação podem incluir `details`.
- Rotas protegidas verificam assinatura/expiração do JWT e confirmam que o usuário ainda existe.
- O limitador atual permite até 100 requisições por janela de 15 minutos para `/api`.
- Senhas usam bcrypt; tokens são assinados com HS256 e expiram em sete dias.
- Fotos são limitadas a 5 MB e convertidas para WebP.
- Configure HTTPS, segredos fortes e regras de acesso do MongoDB para ambientes publicados.

## Organização do código

```text
server/
├── src/
│   ├── controllers/  # Entrada/saída HTTP
│   ├── lib/          # MongoDB, JWT e erro da API
│   ├── middleware/   # Autenticação, upload e erros
│   ├── models/       # User, Anime e AnimeList
│   ├── routes/       # Endpoints Express
│   └── service/      # Regras de negócio e persistência
├── .env.example
├── package.json
└── tsconfig.json
```

Consulte o [README geral](../README.md) para uma visão do AniKeeper e o [README mobile](../mobile/README.md) para configurar o aplicativo cliente.
