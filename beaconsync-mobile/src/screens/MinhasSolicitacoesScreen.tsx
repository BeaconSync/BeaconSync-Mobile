import { useState } from "react";

import {
  ActivityIndicator,
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

import { colors } from "../theme/colors";

import type {
  EstadoSolicitacoesEnviadas,
  SolicitacaoVinculoEnviada,
} from "../types/solicitacaoVinculo";

type Props = {
  estado?: EstadoSolicitacoesEnviadas;
  demonstracao?: boolean;
  onFechar: () => void;
  onTentarNovamente?: () => void;
};

type Filtro =
  | "todos"
  | "pendente"
  | "aprovada"
  | "recusada";

const LISTA_VAZIA: SolicitacaoVinculoEnviada[] = [];

const filtros: { valor: Filtro; titulo: string }[] = [
  { valor: "todos", titulo: "Todos" },
  { valor: "pendente", titulo: "Pendentes" },
  { valor: "aprovada", titulo: "Aprovados" },
  { valor: "recusada", titulo: "Recusados" },
];

const apresentacaoStatus = {
  pendente: {
    titulo: "Aguardando aprovação",
    descricao:
      "Seu pedido aguarda análise. Esta solicitação ainda não liberou acesso ao cadastro.",
    cor: colors.primary,
    fundo: colors.primaryLight,
  },
  aprovada: {
    titulo: "Solicitação aprovada",
    descricao:
      "Seu pedido foi aprovado. Consulte Pessoas para visualizar os cadastros disponíveis para sua conta.",
    cor: "#296546",
    fundo: "#EAF4EE",
  },
  recusada: {
    titulo: "Solicitação recusada",
    descricao:
      "Seu pedido foi recusado. Esta solicitação não concedeu acesso ao cadastro.",
    cor: "#AD3028",
    fundo: "#FBEDEB",
  },
};

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MinhasSolicitacoesScreen({
  estado = { status: "indisponivel" },
  demonstracao = false,
  onFechar,
  onTentarNovamente,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const solicitacoes =
    estado.status === "sucesso"
      ? estado.solicitacoes
      : LISTA_VAZIA;

  const filtradas = solicitacoes.filter(
    (item) => filtro === "todos" || item.status === filtro
  );

  let tituloVazio = "Informações indisponíveis";
  let descricaoVazia =
    "Ainda não foi possível consultar suas solicitações.";

  if (estado.status === "carregando") {
    tituloVazio = "Buscando solicitações";
    descricaoVazia =
      "Aguarde enquanto consultamos seus pedidos.";
  } else if (estado.status === "erro") {
    tituloVazio = "Não foi possível carregar";
    descricaoVazia = estado.mensagem;
  } else if (estado.status === "sucesso") {
    tituloVazio = "Nenhuma solicitação encontrada";

    descricaoVazia =
      filtro === "todos"
        ? "Seus pedidos de vínculo aparecerão aqui após serem registrados."
        : "Nenhuma solicitação corresponde ao filtro selecionado.";
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onFechar}
    >
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={styles.container}
          edges={["top", "bottom", "left", "right"]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Minhas solicitações
            </Text>

            <Pressable
              onPress={onFechar}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
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
                  Acompanhe os pedidos de vínculo que você
                  enviou para acompanhar outras pessoas.
                </Text>

                {demonstracao && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Prévia de desenvolvimento: os pedidos
                      abaixo são fictícios. Nenhuma solicitação
                      ou aprovação real foi registrada.
                    </Text>
                  </View>
                )}

                <View style={styles.filters}>
                  {filtros.map((item) => (
                    <Pressable
                      key={item.valor}
                      onPress={() => setFiltro(item.valor)}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: filtro === item.valor,
                      }}
                      style={({ pressed }) => [
                        styles.filter,
                        filtro === item.valor &&
                          styles.filterSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          filtro === item.valor &&
                            styles.filterTextSelected,
                        ]}
                      >
                        {item.titulo}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.card}>
                {estado.status === "carregando" && (
                  <ActivityIndicator color={colors.primary} />
                )}

                <Text
                  style={styles.cardTitle}
                  accessibilityLiveRegion="polite"
                >
                  {tituloVazio}
                </Text>

                <Text style={styles.description}>
                  {descricaoVazia}
                </Text>

                {estado.status === "erro" &&
                  onTentarNovamente && (
                    <Pressable
                      onPress={onTentarNovamente}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.button,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.buttonText}>
                        Tentar novamente
                      </Text>
                    </Pressable>
                  )}
              </View>
            }
            renderItem={({ item }) => {
              const apresentacao =
                apresentacaoStatus[item.status];

              return (
                <View style={styles.card}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: apresentacao.fundo,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: apresentacao.cor },
                      ]}
                    >
                      {apresentacao.titulo}
                    </Text>
                  </View>

                  <Text style={styles.cardTitle}>
                    Pedido de acompanhamento
                  </Text>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Protocolo
                    </Text>

                    <Text style={styles.value} selectable>
                      {item.id}
                    </Text>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Vínculo informado
                    </Text>

                    <Text style={styles.value}>
                      {item.vinculo}
                    </Text>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Solicitado em
                    </Text>

                    <Text style={styles.value}>
                      {formatarData(item.criadaEm)}
                    </Text>
                  </View>

                  {item.status !== "pendente" && (
                    <View style={styles.field}>
                      <Text style={styles.label}>
                        Decisão registrada em
                      </Text>

                      <Text style={styles.value}>
                        {formatarData(item.decididaEm)}
                      </Text>
                    </View>
                  )}

                  {item.mensagem.trim() ? (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageTitle}>
                        Sua mensagem
                      </Text>

                      <Text style={styles.description}>
                        {item.mensagem}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={styles.description}>
                    {apresentacao.descricao}
                  </Text>
                </View>
              );
            }}
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
    paddingHorizontal: 8,
    justifyContent: "center",
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
    flexWrap: "wrap",
    gap: 10,
  },
  filter: {
    flexBasis: "45%",
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    color: colors.textSecondary,
  },
  filterTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
  card: {
    padding: 18,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  field: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  messageBox: {
    padding: 14,
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  messageTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  separator: {
    height: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});