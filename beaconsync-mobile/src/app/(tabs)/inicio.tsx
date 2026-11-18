import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import MenuTestes from "../../components/MenuTestes";
import SolicitacoesRecebidasConectadas from "../../components/SolicitacoesRecebidasConectadas";

import { useAlertas } from "../../hooks/useAlertas";
import { useMeuPerfil } from "../../hooks/useMeuPerfil";
import { usePessoasAcompanhadas } from "../../hooks/usePessoasAcompanhadas";

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
} from "../../types/solicitacaoVinculo";

type CenarioInicio =
  | "normal"
  | "carregando"
  | "vazio"
  | "erro";

type PainelAberto =
  | "enviadas"
  | "recebidas"
  | null;

function filtrarAlertasAcompanhados(
  estado: EstadoAlertas
): EstadoAlertas {
  if (estado.status !== "sucesso") {
    return estado;
  }

  const ativos = estado.alertas.filter(
    (alerta) => alerta.status === "ativo"
  );

  const incompleto = ativos.some(
    (alerta) =>
      alerta.pessoasRelacionadas?.status !== "sucesso"
  );

  if (incompleto) {
    return {
      status: "erro",
      mensagem:
        "Não foi possível confirmar todos os alertas ligados às pessoas que você acompanha. Abra Alertas para consultar os avisos disponíveis.",
    };
  }

  return {
    status: "sucesso",
    alertas: ativos.filter(
      (alerta) =>
        alerta.pessoasRelacionadas?.status === "sucesso" &&
        alerta.pessoasRelacionadas.pessoas.length > 0
    ),
  };
}

export default function Inicio() {
  const router = useRouter();

  const [cenario, setCenario] =
    useState<CenarioInicio>("normal");

  const [painelAberto, setPainelAberto] =
    useState<PainelAberto>(null);

  const cenarioAtual = __DEV__
    ? cenario
    : "normal";

  const demonstracao = cenarioAtual !== "normal";

  const {
    estado: estadoPerfil,
    recarregar: recarregarPerfil,
  } = useMeuPerfil(!demonstracao);

  const {
    estado: estadoPessoasReal,
    recarregar: recarregarPessoas,
  } = usePessoasAcompanhadas(!demonstracao);

  const {
    estado: estadoAlertasReal,
    recarregar: recarregarAlertas,
  } = useAlertas(!demonstracao);

  let estadoPessoas: EstadoPessoas =
    estadoPessoasReal;

  let estadoAlertas: EstadoAlertas =
    filtrarAlertasAcompanhados(estadoAlertasReal);

  let estadoRecebidasExemplo: EstadoSolicitacoesRecebidas = {
    status: "indisponivel",
  };

  if (cenarioAtual === "carregando") {
    estadoPessoas = { status: "carregando" };
    estadoAlertas = { status: "carregando" };
    estadoRecebidasExemplo = { status: "carregando" };
  } else if (cenarioAtual === "vazio") {
    estadoPessoas = {
      status: "sucesso",
      pessoas: [],
    };

    estadoAlertas = {
      status: "sucesso",
      alertas: [],
    };

    estadoRecebidasExemplo = {
      status: "sucesso",
      solicitacoes: [],
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

    estadoRecebidasExemplo = {
      status: "erro",
      mensagem:
        "Exemplo de falha ao consultar as solicitações.",
    };
  }

  const atualizando =
    !demonstracao &&
    (
      estadoPerfil.status === "carregando" ||
      estadoPessoasReal.status === "carregando" ||
      estadoAlertasReal.status === "carregando"
    );

  function atualizar() {
    if (demonstracao) return;

    void recarregarPerfil();
    recarregarPessoas();
    void recarregarAlertas();
  }

  function abrirPessoa(pessoa: PessoaResumo) {
    router.push({
      pathname: "/pessoa/[id]",
      params: {
        id: pessoa.id,
      },
    });
  }

  function selecionarCenario(valor: CenarioInicio) {
    setPainelAberto(null);
    setCenario(valor);
  }

  function fecharRecebidas() {
    setPainelAberto(null);
    atualizar();
  }

  return (
    <View style={styles.container}>
      <InicioScreen
        nomeUsuario={
          demonstracao
            ? "Usuário de exemplo"
            : estadoPerfil.status === "sucesso"
              ? estadoPerfil.perfil.nome
              : undefined
        }
        estadoPessoas={estadoPessoas}
        estadoAlertas={estadoAlertas}
        demonstracao={demonstracao}
        atualizando={atualizando}
        onAtualizar={atualizar}
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
              onPress: () =>
                selecionarCenario("carregando"),
            },
            {
              id: "inicio-vazio",
              titulo: "Início sem pessoas e sem alertas",
              onPress: () =>
                selecionarCenario("vazio"),
            },
            {
              id: "inicio-erro",
              titulo: "Início com erro de consulta",
              onPress: () =>
                selecionarCenario("erro"),
            },
            {
              id: "inicio-normal",
              titulo: "Fechar prévia do início",
              onPress: () =>
                selecionarCenario("normal"),
            },
          ]}
        />
      )}

      {painelAberto === "enviadas" && (
        <MinhasSolicitacoesScreen
          estado={{ status: "indisponivel" }}
          demonstracao={demonstracao}
          onFechar={() => setPainelAberto(null)}
        />
      )}

      {painelAberto === "recebidas" &&
        (
          demonstracao ? (
            <SolicitacoesRecebidasScreen
              estado={estadoRecebidasExemplo}
              demonstracao
              onFechar={fecharRecebidas}
              onAtualizada={() => {}}
            />
          ) : (
            <SolicitacoesRecebidasConectadas
              onFechar={fecharRecebidas}
            />
          )
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