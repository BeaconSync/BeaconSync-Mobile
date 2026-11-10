import { Users } from "lucide-react-native";
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
  EstadoVinculosPessoa,
  VinculoPessoa,
} from "../types/vinculoPessoa";

type Props = {
  nomePessoa: string;
  estado?: EstadoVinculosPessoa;
  demonstracao?: boolean;
  onFechar: () => void;
  onTentarNovamente?: () => void;
};

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  return partes
    .filter((_, indice) => indice === 0 || indice === partes.length - 1)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function formatarData(valor: string | null) {
  if (!valor) return null;

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return null;

  return data.toLocaleDateString("pt-BR");
}

function CardVinculo({ vinculo }: { vinculo: VinculoPessoa }) {
  const desde = formatarData(vinculo.desde);

  return (
    <View style={styles.card}>
      <View style={styles.personRow}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {obterIniciais(vinculo.nome) || "?"}
          </Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>
            {vinculo.nome}
          </Text>

          <Text style={styles.secondary}>
            {vinculo.vinculo}
          </Text>
        </View>
      </View>

      {vinculo.usuarioAtual && (
        <Text style={styles.currentUser}>
          Este é o seu vínculo
        </Text>
      )}

      {desde && (
        <Text style={styles.secondary}>
          Acompanha desde {desde}
        </Text>
      )}
    </View>
  );
}

export default function VinculosPessoaScreen({
  nomePessoa,
  estado = { status: "indisponivel" },
  demonstracao = false,
  onFechar,
  onTentarNovamente,
}: Props) {
  const vinculos =
    estado.status === "sucesso" ? estado.vinculos : [];

  let tituloMensagem = "Informações indisponíveis";
  let descricaoMensagem =
    "Ainda não foi possível consultar quem tem acesso a este cadastro.";

  if (estado.status === "carregando") {
    tituloMensagem = "Carregando vínculos";
    descricaoMensagem = "Aguarde enquanto buscamos as informações.";
  } else if (estado.status === "erro") {
    tituloMensagem = "Não foi possível carregar";
    descricaoMensagem = estado.mensagem;
  } else if (estado.status === "sucesso") {
    tituloMensagem = "Nenhum vínculo encontrado";
    descricaoMensagem =
      "A consulta não retornou pessoas vinculadas a este cadastro.";
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
              Pessoas com acesso
            </Text>

            <Pressable
              onPress={onFechar}
              accessibilityRole="button"
              accessibilityLabel="Fechar pessoas com acesso"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>

          <FlatList
            data={vinculos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CardVinculo vinculo={item} />
            )}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
            ListHeaderComponent={
              <View style={styles.introduction}>
                {demonstracao && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Prévia de desenvolvimento: os vínculos abaixo
                      são fictícios. Nenhum acesso real foi consultado.
                    </Text>
                  </View>
                )}

                <Text style={styles.title}>
                  Quem acompanha
                </Text>

                <Text style={styles.description}>
                  Pessoas com vínculo aprovado para acompanhar{" "}
                  {nomePessoa}.
                </Text>

                <Text style={styles.secondary}>
                  O vínculo permite acompanhar o cadastro conforme
                  as permissões da conta. Ele não indica disponibilidade
                  para prestar ajuda.
                </Text>

                {estado.status === "sucesso" && (
                  <Text style={styles.counter}>
                    {vinculos.length}{" "}
                    {vinculos.length === 1
                      ? "pessoa vinculada"
                      : "pessoas vinculadas"}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                {estado.status === "carregando" ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                  />
                ) : (
                  <Users size={32} color={colors.primary} />
                )}

                <Text style={styles.emptyTitle}>
                  {tituloMensagem}
                </Text>

                <Text style={styles.emptyDescription}>
                  {descricaoMensagem}
                </Text>

                {estado.status === "erro" && onTentarNovamente && (
                  <Pressable
                    onPress={onTentarNovamente}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.retryText}>
                      Tentar novamente
                    </Text>
                  </Pressable>
                )}
              </View>
            }
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
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  introduction: {
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  secondary: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  counter: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
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
  card: {
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  initials: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  personInfo: {
    flex: 1,
    gap: 4,
  },
  personName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  currentUser: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
  emptyCard: {
    alignItems: "center",
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSecondary,
  },
  retryButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});