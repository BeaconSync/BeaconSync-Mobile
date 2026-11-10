import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { useResponderVinculo } from "../hooks/useResponderVinculo";
import { colors } from "../theme/colors";

import type {
  DecisaoVinculo,
  EstadoSolicitacoesRecebidas,
  ResponderSolicitacaoVinculo,
  SolicitacaoVinculoRecebida,
} from "../types/solicitacaoVinculo";

type Props = {
  estado?: EstadoSolicitacoesRecebidas;
  demonstracao?: boolean;
  onFechar: () => void;
  onAtualizada: (solicitacao: SolicitacaoVinculoRecebida) => void;
  onResponder?: ResponderSolicitacaoVinculo;
  onTentarNovamente?: () => void;
};

const LISTA_VAZIA: SolicitacaoVinculoRecebida[] = [];

const rotulosStatus = {
  pendente: "Aguardando decisão",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

const decisoes: {
  valor: DecisaoVinculo;
  titulo: string;
}[] = [
  { valor: "aprovada", titulo: "Aprovar" },
  { valor: "recusada", titulo: "Recusar" },
];

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  return Number.isNaN(data.getTime())
    ? "Data não informada"
    : data.toLocaleString("pt-BR");
}

export default function SolicitacoesRecebidasScreen({
  estado = { status: "indisponivel" },
  demonstracao = false,
  onFechar,
  onAtualizada,
  onResponder,
  onTentarNovamente,
}: Props) {
  const [filtro, setFiltro] =
    useState<"pendentes" | "todas">("pendentes");

  const { processandoId, erro, responder } =
    useResponderVinculo(onResponder);

  const bloqueado = processandoId !== null;

  const solicitacoes =
    estado.status === "sucesso"
      ? estado.solicitacoes
      : LISTA_VAZIA;

  const filtradas = solicitacoes.filter(
    (item) =>
      filtro === "todas" || item.status === "pendente"
  );

  let mensagemVazia =
    "Ainda não foi possível consultar suas solicitações.";

  if (estado.status === "carregando") {
    mensagemVazia = "Buscando solicitações...";
  } else if (estado.status === "erro") {
    mensagemVazia = estado.mensagem;
  } else if (estado.status === "sucesso") {
    mensagemVazia =
      filtro === "pendentes"
        ? "Nenhuma solicitação pendente nesta consulta."
        : "Nenhuma solicitação recebida nesta consulta.";
  }

  function fechar() {
    if (!bloqueado) onFechar();
  }

  async function enviarDecisao(
    item: SolicitacaoVinculoRecebida,
    decisao: DecisaoVinculo
  ) {
    const atualizada = await responder(item, decisao);

    if (atualizada) {
      onAtualizada(atualizada);
    }
  }

  function confirmarDecisao(
    item: SolicitacaoVinculoRecebida,
    decisao: DecisaoVinculo
  ) {
    if (bloqueado) return;

    const aprovando = decisao === "aprovada";

    Alert.alert(
      aprovando ? "Aprovar vínculo?" : "Recusar solicitação?",
      aprovando
        ? `Você autoriza ${item.solicitanteNome} a acompanhar ${item.pessoaNome} e acessar as informações permitidas para esse vínculo?`
        : `O pedido de ${item.solicitanteNome} será recusado. Esta solicitação não concederá acesso ao cadastro.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: aprovando ? "Aprovar" : "Recusar",
          style: aprovando ? "default" : "destructive",
          onPress: () => {
            void enviarDecisao(item, decisao);
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={fechar}
    >
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={styles.container}
          edges={["top", "bottom", "left", "right"]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Solicitações recebidas
            </Text>

            <Pressable
              onPress={fechar}
              disabled={bloqueado}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                (pressed || bloqueado) && styles.disabled,
              ]}
            >
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>

          <FlatList
            style={styles.list}
            contentContainerStyle={styles.content}
            data={filtradas}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.description}>
                  Revise os pedidos de acesso às pessoas
                  cujos vínculos você pode administrar.
                </Text>

                {demonstracao && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Prévia de desenvolvimento: os pedidos
                      e as permissões abaixo são fictícios.
                    </Text>
                  </View>
                )}

                <View style={styles.filters}>
                  {(["pendentes", "todas"] as const).map(
                    (opcao) => (
                      <Pressable
                        key={opcao}
                        onPress={() => setFiltro(opcao)}
                        disabled={bloqueado}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: filtro === opcao,
                          disabled: bloqueado,
                        }}
                        style={({ pressed }) => [
                          styles.filter,
                          filtro === opcao &&
                            styles.filterSelected,
                          (pressed || bloqueado) &&
                            styles.disabled,
                        ]}
                      >
                        <Text style={styles.filterText}>
                          {opcao === "pendentes"
                            ? "Pendentes"
                            : "Todas"}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.card}>
                {estado.status === "carregando" && (
                  <ActivityIndicator color={colors.primary} />
                )}

                <Text
                  style={styles.description}
                  accessibilityLiveRegion="polite"
                >
                  {mensagemVazia}
                </Text>

                {estado.status === "erro" &&
                  onTentarNovamente && (
                    <Pressable
                      onPress={onTentarNovamente}
                      accessibilityRole="button"
                      style={styles.approveButton}
                    >
                      <Text style={styles.approveText}>
                        Tentar novamente
                      </Text>
                    </Pressable>
                  )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.status}>
                  {rotulosStatus[item.status]}
                </Text>

                <Text style={styles.name}>
                  {item.solicitanteNome}
                </Text>

                <Text style={styles.description}>
                  Deseja acompanhar: {item.pessoaNome}
                </Text>

                <Text style={styles.description}>
                  Vínculo informado: {item.vinculo}
                </Text>

                <Text style={styles.date}>
                  Pedido em: {formatarData(item.criadaEm)}
                </Text>

                {item.mensagem.trim() ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageLabel}>
                      Mensagem do solicitante
                    </Text>

                    <Text style={styles.description}>
                      {item.mensagem}
                    </Text>
                  </View>
                ) : null}

                {item.status === "pendente" &&
                  item.podeDecidir && (
                    <View style={styles.actions}>
                      {decisoes.map((decisao) => (
                        <Pressable
                          key={decisao.valor}
                          onPress={() =>
                            confirmarDecisao(item, decisao.valor)
                          }
                          disabled={bloqueado}
                          accessibilityRole="button"
                          accessibilityLabel={`${decisao.titulo} pedido de ${item.solicitanteNome}`}
                          accessibilityState={{
                            disabled: bloqueado,
                          }}
                          style={({ pressed }) => [
                            decisao.valor === "aprovada"
                              ? styles.approveButton
                              : styles.rejectButton,
                            (pressed || bloqueado) &&
                              styles.disabled,
                          ]}
                        >
                          <Text
                            style={
                              decisao.valor === "aprovada"
                                ? styles.approveText
                                : styles.rejectText
                            }
                          >
                            {decisao.titulo}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                {item.status === "pendente" &&
                  !item.podeDecidir && (
                    <Text style={styles.description}>
                      A decisão não está disponível para sua conta.
                    </Text>
                  )}

                {processandoId === item.id && (
                  <View style={styles.processing}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={styles.description}>
                      Enviando decisão...
                    </Text>
                  </View>
                )}

                {erro?.id === item.id && (
                  <View
                    style={styles.errorBox}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Text style={styles.errorText}>
                      {erro.mensagem}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 15,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  listHeader: {
    gap: 18,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  infoBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.infoText,
  },
  filters: {
    flexDirection: "row",
    gap: 12,
  },
  filter: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.infoBackground,
    color: colors.infoText,
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageBox: {
    padding: 14,
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  messageLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  approveButton: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  approveText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  rejectButton: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#AD3028",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#AD3028",
  },
  processing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  separator: {
    height: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});