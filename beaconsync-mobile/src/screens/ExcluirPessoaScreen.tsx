import { Stack } from "expo-router";
import { AlertTriangle, Trash2 } from "lucide-react-native";
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
  useExcluirPessoa,
  type EnviarExclusaoPessoa,
} from "../hooks/useExcluirPessoa";
import { colors } from "../theme/colors";

type Props = {
  pessoaId: string;
  nomePessoa: string;
  demonstracao?: boolean;
  onCancelar: () => void;
  onExcluido: () => void;
  onExcluir?: EnviarExclusaoPessoa;
};

export default function ExcluirPessoaScreen({
  pessoaId,
  nomePessoa,
  demonstracao = false,
  onCancelar,
  onExcluido,
  onExcluir,
}: Props) {
    const { enviando, erro, excluir } = useExcluirPessoa(
      pessoaId,
      demonstracao ? undefined : onExcluir
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

  async function confirmarExclusao() {
    const sucesso = await excluir();

    if (sucesso) {
      onExcluido();
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Excluir cadastro",
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
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>
                Prévia de desenvolvimento: esta pessoa é fictícia.
                Nenhuma exclusão real está disponível.
              </Text>
            </View>
          )}

          <View style={styles.iconCircle}>
            <Trash2 size={32} color="#AD3028" />
          </View>

          <Text style={styles.title}>
            Excluir o cadastro de {nomePessoa}?
          </Text>

          <Text style={styles.description}>
            Ao confirmar a exclusão, o cadastro e suas informações
            de acompanhamento serão removidos definitivamente.
            As pessoas vinculadas perderão acesso a esse registro.
          </Text>

          <View style={styles.warningBox}>
            <AlertTriangle size={21} color="#AD3028" />

            <Text style={styles.warningText}>
              Esta ação não pode ser desfeita. Ela exclui o
              cadastro inteiro, não apenas o seu vínculo.
            </Text>
          </View>

          <Text style={styles.helper}>
            Nada será excluído até você confirmar abaixo.
          </Text>

          {erro && (
            <View
              style={styles.errorBox}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.warningText}>{erro}</Text>
            </View>
          )}

          <View style={styles.actions}>
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
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={confirmarExclusao}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityState={{
                disabled: enviando,
                busy: enviando,
              }}
              style={({ pressed }) => [
                styles.button,
                styles.deleteButton,
                (pressed || enviando) && styles.disabled,
              ]}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Trash2 size={19} color="#FFFFFF" />
              )}

              <Text style={styles.deleteText}>
                {enviando
                  ? "Excluindo..."
                  : "Excluir definitivamente"}
              </Text>
            </Pressable>
          </View>
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
    paddingBottom: 36,
    gap: 20,
  },
  headerButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingRight: 12,
  },
  headerButtonText: {
    color: colors.primary,
    fontSize: 15,
  },
  demoBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.infoBackground,
  },
  demoText: {
    color: colors.infoText,
    fontSize: 13,
    lineHeight: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBEDEB",
    marginTop: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FBEDEB",
  },
  warningText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FBEDEB",
  },
  actions: {
    gap: 12,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: "#AD3028",
  },
  deleteText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.6,
  },
});