import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import MenuTestes from "../../components/MenuTestes";
import InicioScreen from "../../screens/InicioScreen";
import MinhasSolicitacoesScreen from "../../screens/MinhasSolicitacoesScreen";
import SolicitacoesRecebidasScreen from "../../screens/SolicitacoesRecebidasScreen";

import { colors } from "../../theme/colors";

import type { EstadoAlertas } from "../../types/alerta";
import type {
  EstadoPessoas,
  PessoaResumo,
} from "../../types/pessoa";
import type {
  EstadoSolicitacoesRecebidas,
  SolicitacaoVinculoRecebida,
} from "../../types/solicitacaoVinculo";

type CenarioInicio =
  | "normal"
  | "carregando"
  | "vazio"
  | "erro";

type PainelAberto = "enviadas" | "recebidas" | null;

export default function Inicio() {
  const router = useRouter();

  const [cenario, setCenario] =
    useState<CenarioInicio>("normal");

  const [painelAberto, setPainelAberto] =
    useState<PainelAberto>(null);

  const [estadoRecebidas, setEstadoRecebidas] =
    useState<EstadoSolicitacoesRecebidas>({
      status: "indisponivel",
    });

  const cenarioAtual = __DEV__ ? cenario : "normal";
  const demonstracao = cenarioAtual !== "normal";

  let estadoPessoas: EstadoPessoas = {
    status: "indisponivel",
  };

  let estadoAlertas: EstadoAlertas = {
    status: "indisponivel",
  };

  if (cenarioAtual === "carregando") {
    estadoPessoas = { status: "carregando" };
    estadoAlertas = { status: "carregando" };
  } else if (cenarioAtual === "vazio") {
    estadoPessoas = {
      status: "sucesso",
      pessoas: [],
    };

    estadoAlertas = {
      status: "sucesso",
      alertas: [],
    };
  } else if (cenarioAtual === "erro") {
    estadoPessoas = {
      status: "erro",
      mensagem:
        "Exemplo de falha ao consultar as pessoas acompanhadas.",
    };

    estadoAlertas = {
      status: "erro",
      mensagem:
        "Exemplo de falha ao consultar os alertas.",
    };
  }

  function abrirPessoa(pessoa: PessoaResumo) {
    router.push({
      pathname: "/pessoa/[id]",
      params: { id: pessoa.id },
    });
  }

  function atualizarSolicitacao(
    atualizada: SolicitacaoVinculoRecebida
  ) {
    setEstadoRecebidas((atual) => {
      if (atual.status !== "sucesso") return atual;

      return {
        ...atual,
        solicitacoes: atual.solicitacoes.map((solicitacao) =>
          solicitacao.id === atualizada.id
            ? atualizada
            : solicitacao
        ),
      };
    });
  }

  return (
    <View style={styles.container}>
      <InicioScreen
        nomeUsuario={demonstracao ? "Usuário de exemplo" : undefined}
        estadoPessoas={estadoPessoas}
        estadoAlertas={estadoAlertas}
        demonstracao={demonstracao}
        onAbrirPerfil={() => router.navigate("/perfil")}
        onAbrirPessoas={() => router.navigate("/pessoas")}
        onCadastrarPessoa={() =>
          router.push("/cadastrar-pessoa")
        }
        onAbrirPessoa={abrirPessoa}
        onAbrirAlertas={() => router.navigate("/alertas")}
        onAbrirMinhasSolicitacoes={() =>
          setPainelAberto("enviadas")
        }
        onAbrirSolicitacoesRecebidas={() =>
          setPainelAberto("recebidas")
        }
      />

      {__DEV__ && (
        <MenuTestes
          opcoes={[
            {
              id: "inicio-carregando",
              titulo: "Início carregando",
              onPress: () => setCenario("carregando"),
            },
            {
              id: "inicio-vazio",
              titulo: "Início sem pessoas e sem alertas",
              onPress: () => setCenario("vazio"),
            },
            {
              id: "inicio-erro",
              titulo: "Início com erro de consulta",
              onPress: () => setCenario("erro"),
            },
            {
              id: "inicio-normal",
              titulo: "Fechar prévia do início",
              onPress: () => setCenario("normal"),
            },
          ]}
        />
      )}

      {painelAberto === "enviadas" && (
        <MinhasSolicitacoesScreen
          estado={{ status: "indisponivel" }}
          onFechar={() => setPainelAberto(null)}
        />
      )}

      {painelAberto === "recebidas" && (
        <SolicitacoesRecebidasScreen
          estado={estadoRecebidas}
          onFechar={() => setPainelAberto(null)}
          onAtualizada={atualizarSolicitacao}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});