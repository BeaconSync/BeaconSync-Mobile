import { Stack } from "expo-router";
import { useEffect } from "react";

import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useRemoverMeuVinculo,
  type RemoverMeuVinculo,
} from "../hooks/useRemoverMeuVinculo";

import { colors } from "../theme/colors";

type Props = {
  pessoaId: string;
  nomePessoa: string;
  demonstracao?: boolean;
  onCancelar: () => void;
  onConcluido: () => void;
  onRemover?: RemoverMeuVinculo;
};

export default function PararAcompanhamentoScreen({
  pessoaId,
  nomePessoa,
  demonstracao = false,
  onCancelar,
  onConcluido,
  onRemover,
}: Props) {
  const { enviando, erro, remover } = useRemoverMeuVinculo(
    pessoaId,
    onRemover
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!enviando) onCancelar();
        return true;
      }
    );

    return () => subscription.remove();
  }, [enviando, onCancelar]);

  async function confirmar() {
    const sucesso = await remover();

    if (sucesso) {
      onConcluido();
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Parar de acompanhar",
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            color: colors.text,
          },
          headerLeft: () => (
            <Pressable
              onPress={onCancelar}
              disabled={enviando}
              accessibilityRole="button"
              style={[
                styles.headerButton,
                enviando && styles.disabled,
              ]}
            >
              <Text style={styles.headerButtonText}>
                Cancelar
              </Text>
            </Pressable>
          ),
        }}
      />

      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {demonstracao && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Prévia de desenvolvimento: esta pessoa é
                fictícia. Nenhum vínculo real será removido.
              </Text>
            </View>
          )}

          <Text style={styles.title}>
            Deixar de acompanhar {nomePessoa}?
          </Text>

          <Text style={styles.description}>
            Seu vínculo de acompanhamento com esta pessoa
            será removido.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              O cadastro será mantido
            </Text>

            <Text style={styles.description}>
              Os dados da pessoa continuarão no sistema.
              Os vínculos dos outros responsáveis serão mantidos.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Este vínculo deixará de dar acesso às informações
              da pessoa. Para voltar a acompanhá-la, poderá ser
              necessária uma nova solicitação de acesso.
            </Text>
          </View>

          {erro && (
            <View
              style={styles.errorBox}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          )}

          <Pressable
            onPress={onCancelar}
            disabled={enviando}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              (pressed || enviando) && styles.disabled,
            ]}
          >
            <Text style={styles.cancelText}>
              Continuar acompanhando
            </Text>
          </Pressable>

          <Pressable
            onPress={confirmar}
            disabled={enviando}
            accessibilityRole="button"
            accessibilityState={{
              disabled: enviando,
              busy: enviando,
            }}
            style={({ pressed }) => [
              styles.button,
              styles.removeButton,
              (pressed || enviando) && styles.disabled,
            ]}
          >
            {enviando && (
              <ActivityIndicator color="#FFFFFF" />
            )}

            <Text style={styles.removeText}>
              {enviando
                ? "Removendo vínculo..."
                : "Parar de acompanhar"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  headerButton: {
    minHeight: 44,
    paddingRight: 12,
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 15,
    color: colors.primary,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  infoBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.infoText,
  },
  errorBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#AD3028",
  },
  button: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
    borderRadius: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  removeButton: {
    backgroundColor: "#AD3028",
  },
  removeText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.6,
  },
});