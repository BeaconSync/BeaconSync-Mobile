import {
  excluirPessoa,
} from "../../services/excluirPessoa";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import {
  removerMeuVinculo,
} from "../../services/removerMeuVinculo";
import VinculosPessoaConectados from "../../components/VinculosPessoaConectados";
import { useDetalhesPessoa } from "../../hooks/useDetalhesPessoa";
import EditarPessoaScreen from "../../screens/EditarPessoaScreen";
import DetalhesPessoaScreen from "../../screens/DetalhaPessoaScreen";
import ExcluirPessoaScreen from "../../screens/ExcluirPessoaScreen";
import InformarSituacaoScreen from "../../screens/InformarSituacaoScreen";
import PararAcompanhamentoScreen from "../../screens/PararAcompanhamentoScreen";
import VinculosPessoaScreen from "../../screens/VinculoPessoaScreen";
import EnderecosPessoaScreen from "../../screens/EnderecoPessoaScreen";
import { useTema, usarEstilosTema, type Cores } from "../../theme/tema";
import type { VinculoPessoa } from "../../types/vinculoPessoa";
import { criarEnvioSituacao } from "../../services/informarSituacao";
import EnderecosPessoaConectados from "../../components/EnderecosPessoaConectados";
import {
  criarSalvamentoPessoa,
} from "../../services/editarPessoa";


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
  tipoVulnerabilidade: "PESSOA_COM_DEFICIENCIA",
  necessidadesRemocao:
  "Cadeira de rodas; apoio de outra pessoa.",
  necessidades: ["Mobilidade reduzida", "Deficiência visual"],
  recursos: ["Cadeira de rodas", "Apoio de outra pessoa"],
  observacoes: "Exemplo fictício: precisa de apoio para se deslocar.",
  enderecos: [
    {
      id: "endereco-exemplo",
      nomeLocal: "Casa de referência",
      logradouro: "Rua de Exemplo",
      numero: "100",
      bairro: "Bairro de Exemplo",
      cidade: "Cidade de Exemplo",
      uf: "SP",
      cep: "01000-000",
      complemento: null,
      pontoReferencia: "Referência fictícia para visualizar a tela.",
      tipoImovel: "Casa",
      andar: null,
      indicadoComoAtual: true,
      presencaInformada: null,
      presencaInformadaEm: null,
    },
    {
      id: "endereco-exemplo-2",
      nomeLocal: "Casa da família · exemplo",
      logradouro: "Rua Fictícia",
      numero: "200",
      bairro: "Bairro de Exemplo",
      cidade: "Cidade de Exemplo",
      uf: "SP",
      cep: "01000-000",
      complemento: "Apartamento 12",
      distrito: null,
      pontoReferencia: "Segundo endereço fictício para testar a edição.",
      tipoImovel: "Apartamento",
      andar: 1,
      indicadoComoAtual: false,
      presencaInformada: null,
      presencaInformadaEm: null,
    },
  ],
  situacao: null,
};

const vinculosExemplo: VinculoPessoa[] = [
  {
    id: "vinculo-exemplo-1",
    nome: "Usuário de exemplo",
    vinculo: "Familiar",
    desde: "2026-11-10T10:00:00-03:00",
    usuarioAtual: true,
  },
  {
    id: "vinculo-exemplo-2",
    nome: "Cuidador de exemplo",
    vinculo: "Cuidador",
    desde: "2026-11-09T14:00:00-03:00",
    usuarioAtual: false,
  },
];

export default function DetalhesPessoaRoute() {
  const { colors } = useTema();

  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [exibindoExclusao, setExibindoExclusao] = useState(false);
  const [informandoSituacao, setInformandoSituacao] = useState(false);
  const [removendoVinculo, setRemovendoVinculo] = useState(false);
  const [vendoVinculos, setVendoVinculos] = useState(false);
  const [vendoEnderecos, setVendoEnderecos] = useState(false);
  const [pessoaDemonstracao, setPessoaDemonstracao] = useState(pessoaExemplo);

  const { id, alertaId, alertaTitulo } = useLocalSearchParams<{
    id: string;
    alertaId?: string;
    alertaTitulo?: string;
  }>();

 const demonstracao = __DEV__ && id === "demonstracao";

const {
  estado: estadoReal,
  recarregar,
} = useDetalhesPessoa(
  demonstracao ? undefined : id
);

const estado: EstadoDetalhesPessoa = demonstracao
  ? {
      status: "sucesso",
      pessoa: pessoaDemonstracao,
    }
  : estadoReal;

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/pessoas");
  }

if (removendoVinculo && estado.status === "sucesso") {
  return (
    <PararAcompanhamentoScreen
      key={estado.pessoa.id}
      pessoaId={estado.pessoa.id}
      nomePessoa={estado.pessoa.nome}
      demonstracao={demonstracao}
      onCancelar={() => setRemovendoVinculo(false)}
      onRemover={
        demonstracao
          ? undefined
          : removerMeuVinculo
      }
      onConcluido={() => {
        setRemovendoVinculo(false);
        router.replace("/pessoas");
      }}
    />
  );
}

if (informandoSituacao && estado.status === "sucesso") {
  const alertaSelecionadoId =
    typeof alertaId === "string" && alertaId.trim()
      ? alertaId
      : null;

  const tituloSelecionado =
    typeof alertaTitulo === "string" &&
    alertaTitulo.trim()
      ? alertaTitulo
      : "Alerta selecionado";

  return (
    <InformarSituacaoScreen
      key={`${estado.pessoa.id}-${alertaSelecionadoId ?? "sem-alerta"}`}
      pessoa={estado.pessoa}
      demonstracao={demonstracao}
      contextoAlerta={
        alertaSelecionadoId
          ? {
              id: alertaSelecionadoId,
              titulo: tituloSelecionado,
            }
          : undefined
      }
      onEnviar={
        !demonstracao && alertaSelecionadoId
          ? criarEnvioSituacao(
              estado.pessoa,
              alertaSelecionadoId
            )
          : undefined
      }
      onVoltar={() => setInformandoSituacao(false)}
      onRegistrada={
        demonstracao
          ? undefined
          : () => {
              setInformandoSituacao(false);
              router.replace("/alertas");
            }
      }
    />
  );
}

if (
  exibindoExclusao &&
  estado.status === "sucesso"
) {
  return (
    <ExcluirPessoaScreen
      key={estado.pessoa.id}
      pessoaId={estado.pessoa.id}
      nomePessoa={estado.pessoa.nome}
      demonstracao={demonstracao}

      onCancelar={() =>
        setExibindoExclusao(false)
      }

      onExcluir={
        demonstracao
          ? undefined
          : excluirPessoa
      }

      onExcluido={() => {
        setExibindoExclusao(false);
        router.replace("/pessoas");
      }}
    />
  );
}

if (editando && estado.status === "sucesso") {
  return (
    <EditarPessoaScreen
      key={estado.pessoa.id}
      pessoa={estado.pessoa}
      demonstracao={demonstracao}

      onCancelar={() => setEditando(false)}

      onSalvar={
        demonstracao
          ? undefined
          : criarSalvamentoPessoa(estado.pessoa.id)
      }

      onConcluido={() => {
        setEditando(false);
        recarregar();
      }}
    />
  );
}

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Pessoa acompanhada",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerLeft: undefined,
          headerBackVisible: true,
          gestureEnabled: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }}
      />

      <DetalhesPessoaScreen
        estado={estado}
        demonstracao={demonstracao}
        onVoltar={voltar}
        onTentarNovamente={recarregar}
        onEditar={
          estado.status === "sucesso" ? () => setEditando(true) : undefined
        }
        onInformarSituacao={
          estado.status === "sucesso"
            ? () => setInformandoSituacao(true)
            : undefined
        }
        onAbrirExclusao={
            estado.status === "sucesso"
            ? () => setExibindoExclusao(true)
            : undefined
        }
        onPararAcompanhamento={
  estado.status === "sucesso"
    ? () => setRemovendoVinculo(true)
    : undefined
}
        onVerVinculos={
  estado.status === "sucesso"
    ? () => setVendoVinculos(true)
    : undefined
}
        onGerenciarEnderecos={
          estado.status === "sucesso"
            ? () => setVendoEnderecos(true)
            : undefined
        }
      />

      {vendoVinculos && estado.status === "sucesso" && (
  demonstracao ? (
    <VinculosPessoaScreen
      nomePessoa={estado.pessoa.nome}
      estado={{
        status: "sucesso",
        vinculos: vinculosExemplo,
      }}
      demonstracao
      onFechar={() => setVendoVinculos(false)}
    />
  ) : (
    <VinculosPessoaConectados
      key={estado.pessoa.id}
      pessoaId={estado.pessoa.id}
      nomePessoa={estado.pessoa.nome}
      onFechar={() => setVendoVinculos(false)}
    />
  )
)}

{vendoEnderecos && estado.status === "sucesso" && (
  demonstracao ? (
    <EnderecosPessoaScreen
      key={estado.pessoa.id}
      pessoa={estado.pessoa}
      demonstracao

      onFechar={() =>
        setVendoEnderecos(false)
      }

      onAtualizados={(enderecos) => {
        setPessoaDemonstracao((atual) => ({
          ...atual,
          enderecos,
        }));
      }}
    />
  ) : (
    <EnderecosPessoaConectados
      key={estado.pessoa.id}
      pessoaId={estado.pessoa.id}
      nomePessoa={estado.pessoa.nome}

      onFechar={() => {
        setVendoEnderecos(false);
        recarregar();
      }}
    />
  )
)}
    </>
  );
}
