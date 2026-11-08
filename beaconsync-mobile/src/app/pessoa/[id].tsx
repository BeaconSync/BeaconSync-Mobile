import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import DetalhesPessoaScreen from "../../screens/DetalhaPessoaScreen";
import { colors } from "../../theme/colors";
import type {
  EstadoDetalhesPessoa,
  PessoaDetalhes,
} from "../../types/detalhaPessoa";

const pessoaExemplo: PessoaDetalhes = {
  id: "demonstracao",
  nome: "Pessoa de exemplo",
  dataNascimento: "1960-05-18",
  fotoUrl: null,
  vinculo: "Familiar",

  necessidades: [
    "Mobilidade reduzida",
    "Deficiência visual",
  ],
  recursos: [
    "Cadeira de rodas",
    "Apoio de outra pessoa",
  ],
  observacoes:
    "Exemplo fictício: precisa de apoio para se deslocar.",

  enderecos: [
    {
      id: "endereco-exemplo",
      nomeLocal: "Casa de referência",
      logradouro: "Rua de Exemplo",
      numero: "100",
      bairro: "Bairro de Exemplo",
      cidade: "Cidade de Exemplo",
      uf: "SP",
      complemento: null,
      pontoReferencia: "Referência fictícia para visualizar a tela.",
      tipoImovel: "Casa",
      andar: null,
      indicadoComoAtual: true,
      presencaInformada: null,
      presencaInformadaEm: null,
    },
  ],

  situacao: null,
};

export default function DetalhesPessoaRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const demonstracao = __DEV__ && id === "demonstracao";

  const estado: EstadoDetalhesPessoa = demonstracao
    ? {
        status: "sucesso",
        pessoa: pessoaExemplo,
      }
    : {
        status: "indisponivel",
      };

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/pessoas");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Pessoa acompanhada",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />

      <DetalhesPessoaScreen
        estado={estado}
        demonstracao={demonstracao}
        onVoltar={voltar}
      />
    </>
  );
}