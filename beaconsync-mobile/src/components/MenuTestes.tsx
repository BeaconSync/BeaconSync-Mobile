import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../theme/colors";

type OpcaoTeste = {
  id: string;
  titulo: string;
  onPress: () => void;
};

type Props = {
  opcoes: OpcaoTeste[];
};

export default function MenuTestes({ opcoes }: Props) {
  const [aberto, setAberto] = useState(false);

  if (!__DEV__) return null;

  const Icone = aberto ? ChevronDown : ChevronUp;

  function selecionar(opcao: OpcaoTeste) {
    setAberto(false);
    opcao.onPress();
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setAberto((atual) => !atual)}
        accessibilityRole="button"
        accessibilityLabel={
          aberto ? "Recolher opções de teste" : "Abrir opções de teste"
        }
        accessibilityState={{ expanded: aberto }}
        style={({ pressed }) => [
          styles.toggle,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.toggleText}>Prévias de teste</Text>
        <Icone size={20} color={colors.primary} />
      </Pressable>

      {aberto && (
        <ScrollView
          style={styles.options}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.id}
              onPress={() => selecionar(opcao)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionText}>
                {opcao.titulo}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggle: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  options: {
    maxHeight: 220,
  },
  optionsContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});