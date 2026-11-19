# BeaconSync — Mobile

Aplicativo para acompanhar pessoas vulneráveis e apoiar a organização de informações em situações de risco, como enchentes. O BeaconSync reúne cadastros, vínculos com responsáveis, alertas, registros de situação e informações para voluntários.

Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas da FIAP.

> O aplicativo apoia o acompanhamento e a triagem. Um cadastro, uma cor no mapa ou uma análise de IA não confirmam segurança, envio de equipe ou resgate imediato.

## Vídeo de demonstração

Apresentação do BeaconSync e dos principais fluxos do aplicativo.

**Link do vídeo com mais de 5 minutos:** [VIDEO](https://youtu.be/BxVTSpUBgOs)

**Link do vídeo com 5 minutos:** [VIDEO](https://youtu.be/G4l_A6pa7gw)

## Funcionalidades

### Conta e perfil

- Cadastro, login, saída da conta e renovação de sessão pela API Java.
- Consulta e edição de nome, telefone, e-mail e foto de perfil.
- Perfis de responsável e voluntário.
- Alteração do tipo de perfil, com integração às regras de disponibilidade do voluntariado.
- Temas claro, escuro e automático, acompanhando a preferência do sistema.
- Tela Sobre com informações do projeto, equipe, versão e identificação do commit da compilação.

### Pessoas acompanhadas

- Cadastro e edição de pessoas vulneráveis.
- Lista com busca por nome e acesso aos detalhes.
- Registro de necessidades de apoio, endereços e vínculos.
- Solicitação de vínculo, consulta dos pedidos enviados e análise dos recebidos.
- Encerramento do próprio acompanhamento e exclusão conforme as permissões da API.

### Alertas e situação

- Consulta de alertas ativos e encerrados e das regiões abrangidas.
- Registro da situação de pessoas acompanhadas: seguro, precisa de ajuda ou sem contato.
- Indicação de endereço e observação no registro da situação.
- Consulta das informações retornadas pela API para cada alerta.

### Voluntariado, mapa e IA

- Cadastro de voluntariado com cidade, UF, contato, especialidade e observações.
- Consulta e atualização da disponibilidade para ajudar.
- Acesso ao mapa na interface de voluntários.
- Visualização dos distritos de São Paulo, contagens e faixas de cor retornadas pelo Java.
- Consulta da análise de IA por distrito e alerta, intermediada pela API Java.

As funcionalidades integradas utilizam as APIs Java e .NET, conforme as permissões da conta.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React Native e Expo | Aplicativo mobile |
| TypeScript | Tipagem e organização do código |
| Expo Router | Navegação entre telas |
| Expo SecureStore | Armazenamento local protegido de dados de sessão no dispositivo |
| React Native Maps | Exibição do mapa na versão nativa |
| Lucide React Native | Ícones da interface |
| EAS Build | Compilação e assinatura do aplicativo |
| Firebase App Distribution | Distribuição do APK para avaliadores e testadores |

As versões das dependências estão em `beaconsync-mobile/package.json` e `package-lock.json`.

## Integração com as APIs

| Funcionalidade | Serviço responsável |
| --- | --- |
| Conta, autenticação e renovação de tokens | Java |
| Perfil da conta e foto | Java |
| Pessoas vulneráveis, endereços e vínculos | Java |
| Solicitações de vínculo | Java |
| Alertas e registros de situação | Java |
| Contagens por distrito para o mapa | Java |
| Cadastro e disponibilidade de voluntários | .NET |
| Equipes e operações de resgate | Java, integrado à disponibilidade no .NET |
| Análise de IA | Java → Python |

O mobile se comunica com Java e .NET. A chamada ao serviço Python é feita pelo Java. O Firebase App Distribution distribui o instalador; os dados de negócio continuam nas APIs.

O perfil de conta no Java e o cadastro de voluntariado no .NET são registros distintos. Selecionar o papel de voluntário não substitui o preenchimento e a gravação dos dados de voluntariado.

### Repositórios

- [Aplicativo mobile](https://github.com/BeaconSync/BeaconSync-Mobile)
- [API Java](https://github.com/BeaconSync/beaconSyncAPI)
- [API .NET](https://github.com/Portifolio-Pamella/BeaconSync---Rastreador-de-Vulnerabilidades-.NET)

## Executar localmente

### Pré-requisitos

- Git.
- Node.js em versão compatível com o SDK Expo do projeto e npm.
- Dispositivo ou emulador compatível com o projeto.
- APIs Java e .NET disponíveis e configuradas.

### 1. Obter o projeto

```bash
git clone https://github.com/BeaconSync/BeaconSync-Mobile.git
cd BeaconSync-Mobile/beaconsync-mobile
npm ci
```

Se o projeto já estiver aberto no computador, execute os comandos a partir da pasta que contém o `package.json`.

### 2. Configurar o ambiente

Crie um arquivo `.env` dentro de `beaconsync-mobile`:

```dotenv
EXPO_PUBLIC_JAVA_API_URL=https://beaconsync-api.onrender.com
EXPO_PUBLIC_NET_API_URL=https://SEU-SERVIDOR-DOTNET
```

Substitua o endereço do .NET pela URL do serviço implantado. Caso use outro ambiente Java, atualize também o primeiro valor.

- Informe a URL base, sem acrescentar `/api/v1`: os serviços do aplicativo incluem esse caminho nas requisições.
- No celular físico, `localhost` aponta para o próprio celular. Para servidores locais, use um endereço acessível na rede.
- Variáveis `EXPO_PUBLIC_*` são incorporadas ao aplicativo e não devem conter segredos.
- Não inclua senhas de banco, segredo de assinatura JWT, tokens de usuário ou credenciais privadas no aplicativo ou no repositório.

### 3. Iniciar

```bash
npx expo start
```

Abra o aplicativo pelo ambiente compatível com o SDK instalado. Se modificar as variáveis ou houver cache desatualizado:

```bash
npx expo start -c
```

### 4. Verificar o projeto

```bash
npx tsc --noEmit
npx expo-doctor
npx expo install --check
```

Essas verificações ajudam a encontrar problemas de tipagem e dependências. Elas não substituem testes de integração com os servidores e testes no dispositivo.

## Organização do código

Os principais diretórios ficam em `beaconsync-mobile/src`:

| Diretório | Responsabilidade |
| --- | --- |
| `app` | Rotas e layouts de navegação |
| `screens` | Telas e formulários |
| `components` | Componentes reutilizáveis e fluxos conectados |
| `hooks` | Estado, consultas e ações das telas |
| `services` | Comunicação com APIs, sessão e tratamento de respostas |
| `types` | Tipos e contratos utilizados pelo mobile |
| `theme` | Paletas, preferência de aparência e estilos temáticos |
| `data` | Dados locais, limites geográficos e informações da equipe |
| `utils` | Funções auxiliares |

## Mapa e análise de IA

O mapa utiliza limites geográficos dos distritos de São Paulo, com geometria simplificada para visualização, provenientes do GeoSampa / Prefeitura de São Paulo.

As contagens e faixas de cor são fornecidas pelo Java para o alerta selecionado. Cinza indica ausência de dados naquele alerta; não significa ausência de pessoas. As contagens representam os registros disponíveis no sistema, e não a população total da região.

Ao selecionar um distrito com dados, o usuário pode consultar as contagens e solicitar a análise da IA. O Java prepara os dados, chama o serviço Python e devolve o resultado ao aplicativo.

O acesso ao mapa é apresentado na interface de voluntários. As permissões sobre os dados também devem ser validadas pelo servidor.

Para o mapa nativo funcionar no APK Android, confira a configuração do provedor de mapas, da chave e das restrições referentes ao pacote e ao certificado de assinatura. O funcionamento no Expo Go não garante essa configuração no APK.

## Gerar o APK Android

Execute os comandos dentro de `beaconsync-mobile`.

1. Confirme a conta Expo e o vínculo com o projeto correto:

```bash
npx eas-cli@latest login
npx eas-cli@latest project:info
```

Se o projeto ainda não estiver vinculado, execute `npx eas-cli@latest init` e selecione o projeto BeaconSync correspondente.

2. Confira o `android.package` da configuração Expo e preserve o identificador registrado para o aplicativo.
3. Configure as URLs públicas das APIs no ambiente `preview` do EAS. O `.env` local não deve ser a única fonte de configuração para a compilação remota.
4. Confira o perfil de distribuição no `eas.json`. Exemplo mínimo; preserve outros perfis e configurações existentes:

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

5. Revise e faça commit das alterações antes de gerar a versão. Depois execute:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Use a chave de assinatura existente quando houver. Ao concluir, baixe o APK disponibilizado pelo EAS.

## Distribuir pelo Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Selecione o projeto e o aplicativo Android com o mesmo nome de pacote configurado no Expo.
3. Abra **App Distribution** e envie o APK gerado pelo EAS.
4. Adicione os e-mails ou grupos de testadores.
5. Preencha as notas da versão e distribua a compilação.

Esse fluxo distribui o aplicativo para testadores; não representa publicação na Google Play. O APK é destinado ao Android e não pode ser instalado no iPhone. Para o envio manual pelo console, não é necessário instalar o Firebase CLI.

## Versão e commit

A tela Sobre apresenta a versão configurada no Expo e o identificador do commit obtido pela configuração dinâmica durante a preparação da compilação.

O identificador representa a revisão usada para gerar aquela versão; ele não acompanha automaticamente novos commits enviados ao GitHub. Faça commit das mudanças antes do build para manter essa identificação coerente com o código distribuído.

## Equipe

Projeto desenvolvido pela equipe BeaconSync, da FIAP.

| Integrante | RM |
| --- | --- |
| Felipe Ribeiro Salles de Camargo | 565224 |
| João Pedro Pereira Camilo | 562005 |
| Lucas Matsubara | 565020 |
| Pamella Christiny Chaves Brito | 565206 |

## Documentação de apoio

- [Expo](https://docs.expo.dev/)
- [Geração de APK com EAS](https://docs.expo.dev/build-reference/apk/)
- [Variáveis de ambiente no EAS](https://docs.expo.dev/eas/environment-variables/)
- [Firebase App Distribution para Android](https://firebase.google.com/docs/app-distribution/android/distribute-console)
- [GeoSampa](https://geosampa.prefeitura.sp.gov.br/)
