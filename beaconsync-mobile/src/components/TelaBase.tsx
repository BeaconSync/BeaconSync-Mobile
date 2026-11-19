import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

type TelaBaseProps = {
  titulo: string;
  descricao: string;
  children?: ReactNode;
};

export default function TelaBase({
  titulo,
  descricao,
  children,
}: TelaBaseProps) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.description}>{descricao}</Text>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: 24,
  },
}));