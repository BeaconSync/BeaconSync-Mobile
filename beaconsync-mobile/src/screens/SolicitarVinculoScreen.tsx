import { Check, Lock } from "lucide-react-native";

import {
  ActivityIndicator,
  Keyboard,
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

import {
  opcoesVinculo,
  useSolicitarVinculo,
} from "../hooks/useSolicitarVinculo";

import { colors } from "../theme/colors";

import type {
  EnviarSolicitacaoVinculo,
} from "../types/solicitacaoVinculo";

type Props = {
  referenciaCadastro: string;
  demonstracao?: boolean;
  onFechar: () => void;
  onConcluido?: () => void;
  onSolicitar?: EnviarSolicitacaoVinculo;
};

export default function SolicitarVinculoScreen({
  referenciaCadastro,
  demonstracao = false,
  onFechar,
  onConcluido,
  onSolicitar,
}: Props) {
  const {
    vinculo,
    enviando,
    erro,
    solicitacao,
    selecionarVinculo,
    solicitar,
  } = useSolicitarVinculo(
    referenciaCadastro,
    demonstracao ? undefined : onSolicitar
  );

function fechar() {
  if (enviando) return;

  Keyboard.dismiss();

  if (solicitacao && onConcluido) {
    onConcluido();
  } else {
    onFechar();
  }
}

  async function confirmar() {
    Keyboard.dismiss();
    await solicitar();
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
              Solicitar vínculo
            </Text>

            <Pressable
              onPress={fechar}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityState={{ disabled: enviando }}
              style={({ pressed }) => [
                styles.headerButton,
                (pressed || enviando) && styles.disabled,
              ]}
            >
              <Text style={styles.headerButtonText}>
                {solicitacao ? "Fechar" : "Voltar"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            {demonstracao && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Prévia de desenvolvimento: este cenário é
                  fictício. Nenhum cadastro real foi consultado.
                </Text>
              </View>
            )}

            {solicitacao ? (
              <>
                <View style={styles.iconCircle}>
                  <Check
                    size={32}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.title}>
                  Solicitação enviada
                </Text>

                <Text style={styles.description}>
                  Seu pedido foi registrado e está aguardando
                  análise por quem pode autorizar o vínculo.
                </Text>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Aguardando aprovação
                  </Text>

                  <Text style={styles.description}>
                    O acesso às informações da pessoa ainda
                    não foi liberado.
                  </Text>
                </View>

                <Pressable
                  onPress={fechar}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    Concluir
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.iconCircle}>
                  <Lock
                    size={30}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.title}>
                  Já existe um cadastro
                </Text>

                <Text style={styles.description}>
                  Solicite um vínculo para acompanhar a pessoa
                  pelo cadastro existente. Os dados dela
                  permanecem protegidos até a autorização.
                </Text>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Um pedido de acesso
                  </Text>

                  <Text style={styles.description}>
                    Sua solicitação será analisada por quem
                    pode autorizar o vínculo. Você só poderá
                    acompanhar a pessoa após a aprovação.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>
                    Qual é seu vínculo com a pessoa?
                  </Text>

                  <View style={styles.options}>
                    {opcoesVinculo.map((opcao) => {
                      const selecionada = vinculo === opcao;

                      return (
                        <Pressable
                          key={opcao}
                          onPress={() =>
                            selecionarVinculo(opcao)
                          }
                          disabled={enviando}
                          accessibilityRole="radio"
                          accessibilityState={{
                            checked: selecionada,
                            disabled: enviando,
                          }}
                          style={({ pressed }) => [
                            styles.option,
                            selecionada &&
                              styles.optionSelected,
                            (pressed || enviando) &&
                              styles.disabled,
                          ]}
                        >
                          <View
                            style={[
                              styles.radio,
                              selecionada &&
                                styles.radioSelected,
                            ]}
                          >
                            {selecionada && (
                              <View style={styles.radioDot} />
                            )}
                          </View>

                          <Text style={styles.optionText}>
                            {opcao}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>               

                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Solicitar vínculo não concede acesso
                    automaticamente.
                  </Text>
                </View>

                {erro && (
                  <View
                    style={styles.errorBox}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Text style={styles.errorText}>
                      {erro}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={confirmar}
                  disabled={enviando}
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: enviando,
                    busy: enviando,
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || enviando) &&
                      styles.disabled,
                  ]}
                >
                  {enviando && (
                    <ActivityIndicator
                      color={colors.surface}
                    />
                  )}

                  <Text style={styles.primaryButtonText}>
                    {enviando
                      ? "Enviando..."
                      : "Solicitar vínculo"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={fechar}
                  disabled={enviando}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    (pressed || enviando) &&
                      styles.disabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    Voltar
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
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
    justifyContent: "space-between",
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
  headerButton: {
    minHeight: 48,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 15,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginTop: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  card: {
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  input: {
    minHeight: 120,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  counter: {
    fontSize: 12,
    textAlign: "right",
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
  warningBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary,
  },
  errorBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.surface,
  },
  secondaryButton: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
});