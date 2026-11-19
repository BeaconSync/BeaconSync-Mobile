import { useState } from "react";

import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import SolicitarVinculoScreen
  from "../screens/SolicitarVinculoScreen";

import {
  criarSolicitacaoVinculo,
} from "../services/solicitarVinculo";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

type Props = {
  onFechar: () => void;
  onConcluido?: () => void;
};

export default function SolicitarVinculoConectado({
  onFechar,
  onConcluido,
}: Props) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [codigo, setCodigo] = useState("");
  const [pessoaId, setPessoaId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function continuar() {
    Keyboard.dismiss();

    const valor = codigo.trim();

    if (
      !/^[1-9]\d*$/.test(valor) ||
      !Number.isSafeInteger(Number(valor))
    ) {
      setErro(
        "Informe o código numérico compartilhado por quem acompanha a pessoa.",
      );
      return;
    }

    setErro(null);
    setPessoaId(valor);
  }

  if (pessoaId) {
    return (
      <SolicitarVinculoScreen
        key={pessoaId}
        referenciaCadastro={pessoaId}
        onSolicitar={criarSolicitacaoVinculo(pessoaId)}
        onFechar={() => setPessoaId(null)}
        onConcluido={onConcluido ?? onFechar}
      />
    );
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onFechar}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Solicitar vínculo
            </Text>

            <Pressable
              onPress={onFechar}
              accessibilityRole="button"
              style={styles.closeButton}
            >
              <Text style={styles.link}>Cancelar</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            <Text style={styles.title}>
              Quem você quer acompanhar?
            </Text>

            <Text style={styles.description}>
              Peça o código do cadastro a alguém que já acompanha
              essa pessoa. Ele aparece na tela de detalhes dela.
            </Text>

            <Text style={styles.label}>
              Código do cadastro
            </Text>

            <TextInput
              value={codigo}
              onChangeText={(valor) => {
                setCodigo(valor);
                setErro(null);
              }}
              placeholder="Digite o código recebido"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              autoCorrect={false}
              maxLength={16}
              accessibilityLabel="Código do cadastro da pessoa"
              style={styles.input}
            />

            {erro && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {erro}
              </Text>
            )}

            <View style={styles.notice}>
              <Text style={styles.description}>
                O código identifica o cadastro, mas não libera
                acesso aos dados. Seu pedido precisa ser aprovado
                por quem já acompanha a pessoa.
              </Text>
            </View>

            <Pressable
              onPress={continuar}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
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
  link: {
    fontSize: 15,
    color: colors.primary,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 18,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    minHeight: 54,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  notice: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.danger,
  },
  button: {
    minHeight: 52,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
}));