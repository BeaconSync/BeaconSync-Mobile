import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { usePessoasAcompanhadas } from "../../hooks/usePessoasAcompanhadas";
import MenuTestes from "../../components/MenuTestes";
import MinhasSolicitacoesScreen from "../../screens/MinhasSolicitacoesScreen";
import PessoasScreen from "../../screens/PessoasScreen";
import SolicitacoesRecebidasScreen from "../../screens/SolicitacoesRecebidasScreen";
import SolicitarVinculoScreen from "../../screens/SolicitarVinculoScreen";

import { colors } from "../../theme/colors";

import type {
  SolicitacaoVinculoEnviada,
  SolicitacaoVinculoRecebida,
} from "../../types/solicitacaoVinculo";

const pedidosExemplo: SolicitacaoVinculoRecebida[] = [
  {
    id: "pedido-pendente-exemplo",
    pessoaId: "demonstracao",
    pessoaNome: "Pessoa de exemplo",
    solicitanteNome: "Familiar de exemplo",
    vinculo: "Familiar",
    mensagem:
      "Pedido fictício: gostaria de ajudar no acompanhamento.",
    criadaEm: "2026-11-10T14:00:00-03:00",
    status: "pendente",
    podeDecidir: true,
  },
  {
    id: "pedido-historico-exemplo",
    pessoaId: "demonstracao",
    pessoaNome: "Pessoa de exemplo",
    solicitanteNome: "Solicitante de exemplo",
    vinculo: "Outro",
    mensagem:
      "Registro fictício para visualizar o histórico.",
    criadaEm: "2026-11-09T10:00:00-03:00",
    status: "recusada",
    podeDecidir: false,
  },
];

const minhasSolicitacoesExemplo: SolicitacaoVinculoEnviada[] = [
  {
    id: "EXEMPLO-001",
    vinculo: "Familiar",
    mensagem:
      "Pedido fictício: gostaria de ajudar no acompanhamento de um familiar.",
    criadaEm: "2026-11-10T10:00:00-03:00",
    decididaEm: null,
    status: "pendente",
  },
  {
    id: "EXEMPLO-002",
    vinculo: "Cuidador",
    mensagem:
      "Pedido fictício: presto apoio nos cuidados diários.",
    criadaEm: "2026-11-09T09:00:00-03:00",
    decididaEm: "2026-11-09T14:00:00-03:00",
    status: "aprovada",
  },
  {
    id: "EXEMPLO-003",
    vinculo: "Amigo",
    mensagem:
      "Pedido fictício para visualizar uma solicitação recusada.",
    criadaEm: "2026-11-08T11:00:00-03:00",
    decididaEm: "2026-11-09T10:00:00-03:00",
    status: "recusada",
  },
];

export default function PessoasRoute() {

  const router = useRouter();
  const { estado, recarregar } = usePessoasAcompanhadas();

  const [solicitandoVinculo, setSolicitandoVinculo] =
    useState(false);

  const [vendoSolicitacoes, setVendoSolicitacoes] =
    useState(false);

  const [
    vendoMinhasSolicitacoes,
    setVendoMinhasSolicitacoes,
  ] = useState(false);

  const [pedidosRecebidos, setPedidosRecebidos] =
    useState<SolicitacaoVinculoRecebida[]>(pedidosExemplo);

  function atualizarSolicitacao(
    atualizada: SolicitacaoVinculoRecebida
  ) {
    setPedidosRecebidos((atuais) =>
      atuais.map((item) =>
        item.id === atualizada.id ? atualizada : item
      )
    );
  }

  function abrirPessoa(id: string) {
    router.push({
      pathname: "/pessoa/[id]",
      params: { id },
    });
  }

  return (
    <View style={styles.container}>
      <PessoasScreen
          estado={estado}
          onTentarNovamente={recarregar}
          onCadastrar={() => router.push("/cadastrar-pessoa")}
          onAbrirPessoa={(pessoa) => abrirPessoa(pessoa.id)}
        />

      {__DEV__ && (
        <MenuTestes
          opcoes={[
            {
              id: "pessoa",
              titulo: "Pessoa de exemplo",
              onPress: () => abrirPessoa("demonstracao"),
            },
            {
              id: "solicitar-vinculo",
              titulo: "Solicitar vínculo",
              onPress: () => setSolicitandoVinculo(true),
            },
            {
              id: "solicitacoes-recebidas",
              titulo: "Solicitações recebidas",
              onPress: () => setVendoSolicitacoes(true),
            },
            {
              id: "minhas-solicitacoes",
              titulo: "Minhas solicitações",
              onPress: () => setVendoMinhasSolicitacoes(true),
            },
          ]}
        />
      )}

      {__DEV__ && solicitandoVinculo && (
        <SolicitarVinculoScreen
          referenciaCadastro="cadastro-demonstracao"
          demonstracao
          onFechar={() => setSolicitandoVinculo(false)}
        />
      )}

      {__DEV__ && vendoSolicitacoes && (
        <SolicitacoesRecebidasScreen
          estado={{
            status: "sucesso",
            solicitacoes: pedidosRecebidos,
          }}
          demonstracao
          onFechar={() => setVendoSolicitacoes(false)}
          onAtualizada={atualizarSolicitacao}
        />
      )}

      {__DEV__ && vendoMinhasSolicitacoes && (
        <MinhasSolicitacoesScreen
          estado={{
            status: "sucesso",
            solicitacoes: minhasSolicitacoesExemplo,
          }}
          demonstracao
          onFechar={() => setVendoMinhasSolicitacoes(false)}
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