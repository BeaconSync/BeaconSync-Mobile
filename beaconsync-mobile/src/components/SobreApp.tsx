import { useState } from "react";
import Constants from "expo-constants";
import { ChevronRight, Info, X } from "lucide-react-native";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { equipe } from "../data/equipe";

import {
  useTema,
  usarEstilosTema,
  type Cores,
} from "../theme/tema";

function obterCommit(): string | null {
  const valor: unknown =
    Constants.expoConfig?.extra?.sobre?.commit;

  return typeof valor === "string" &&
    /^[a-f0-9]{40,64}$/i.test(valor)
    ? valor
    : null;
}

export default function SobreApp() {
  const [aberto, setAberto] = useState(false);

  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const versao =
    Constants.expoConfig?.version ?? "Não informada";

  const commit = obterCommit();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir informações sobre o BeaconSync"
        onPress={() => setAberto(true)}
        style={({ pressed }) => [
          styles.accessButton,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          <Info size={22} color={colors.primary} />
        </View>

        <View style={styles.flex}>
          <Text style={styles.accessTitle}>
            Sobre o BeaconSync
          </Text>

          <Text style={styles.smallText}>
            Conheça o projeto, a equipe e a versão.
          </Text>
        </View>

        <ChevronRight
          size={21}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={aberto}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setAberto(false)}
      >
        <SafeAreaProvider style={styles.container}>
          <SafeAreaView
            style={styles.container}
            edges={["top", "bottom", "left", "right"]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Sobre o aplicativo
              </Text>

              <Pressable
                onPress={() => setAberto(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar informações do aplicativo"
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.brand}>
                <View style={styles.brandIcon}>
                  <Info size={34} color={colors.primary} />
                </View>

                <Text style={styles.appName}>
                  BeaconSync
                </Text>

                <Text style={styles.tagline}>
                  Informação para acompanhar e apoiar.
                </Text>

                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>
                    Versão {versao}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  O que fazemos
                </Text>

                <Text style={styles.text}>
                  O BeaconSync ajuda responsáveis e voluntários
                  a acompanhar pessoas com necessidades de
                  apoio durante situações de risco, como
                  enchentes.
                </Text>

                <Text style={styles.text}>
                  O aplicativo reúne cadastros, endereços,
                  vínculos e alertas. Também permite informar
                  se uma pessoa está segura, precisa de ajuda
                  ou está sem contato.
                </Text>

                <Text style={styles.text}>
                  Os voluntários podem gerenciar sua
                  disponibilidade e consultar dados por
                  distrito, com análises de inteligência
                  artificial para apoiar a interpretação
                  das informações disponíveis.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Nosso projeto
                </Text>

                <Text style={styles.text}>
                  Projeto acadêmico desenvolvido na FIAP,
                  no curso de Análise e Desenvolvimento
                  de Sistemas, integrando desenvolvimento
                  mobile, APIs, banco de dados e inteligência
                  artificial.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Equipe responsável
                </Text>

                {equipe.map((integrante) => (
                  <View
                    key={integrante.rm}
                    style={styles.member}
                  >
                    <Text style={styles.memberName}>
                      {integrante.nome}
                    </Text>

                    <Text style={styles.smallText}>
                      RM {integrante.rm}
                    </Text>

                    <Text style={styles.text}>
                      {integrante.responsabilidade}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Informações da versão
                </Text>

                <View style={styles.detail}>
                  <Text style={styles.smallText}>
                    Versão do aplicativo
                  </Text>

                  <Text selectable style={styles.detailValue}>
                    {versao}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.smallText}>
                    Commit de referência
                  </Text>

                  <Text selectable style={styles.detailValue}>
                    {commit
                      ? commit.slice(0, 8)
                      : "Não disponível nesta versão"}
                  </Text>
                </View>

                <Text style={styles.smallText}>
                  Identifica a revisão do código registrada
                  na preparação desta versão.
                </Text>
              </View>

              <View style={styles.notice}>
                <Info
                  size={20}
                  color={colors.infoText}
                />

                <Text style={styles.noticeText}>
                  O BeaconSync é uma ferramenta de apoio.
                  Informar uma situação no aplicativo não
                  confirma o envio de equipes nem substitui
                  os canais oficiais de emergência.
                </Text>
              </View>

              <Pressable
                onPress={() => setAberto(false)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.backText}>
                  Voltar ao perfil
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const criarStyles = (colors: Cores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
      gap: 4,
    },
    accessButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 18,
      minHeight: 80,
      marginBottom: 24,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryLight,
    },
    accessTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    smallText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 19,
      fontWeight: "600",
      color: colors.text,
    },
    closeButton: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
      padding: 20,
      paddingBottom: 32,
      gap: 20,
    },
    brand: {
      alignItems: "center",
      gap: 12,
      paddingVertical: 20,
    },
    brandIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.text,
    },
    tagline: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
      color: colors.textSecondary,
    },
    versionBadge: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
    },
    versionText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    card: {
      padding: 20,
      gap: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "600",
      color: colors.text,
    },
    text: {
      fontSize: 14,
      lineHeight: 23,
      color: colors.textSecondary,
    },
    member: {
      gap: 5,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    memberName: {
      fontSize: 16,
      lineHeight: 23,
      fontWeight: "600",
      color: colors.text,
    },
    detail: {
      gap: 5,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    notice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.infoBackground,
    },
    noticeText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 21,
      color: colors.infoText,
    },
    backButton: {
      minHeight: 52,
      padding: 15,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: colors.primary,
    },
    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.onPrimary,
    },
    pressed: {
      opacity: 0.7,
    },
  });