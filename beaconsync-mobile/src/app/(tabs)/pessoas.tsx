import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import PessoasScreen from "../../screens/PessoasScreen";
import { colors } from "../../theme/colors";

export default function PessoasRoute() {
  const router = useRouter();

  function abrirPessoa(id: string) {
    router.push({
      pathname: "/pessoa/[id]",
      params: { id },
    });
  }

  return (
    <View style={styles.container}>
      <PessoasScreen
        estado={{ status: "indisponivel" }}
        onCadastrar={() => router.push("/cadastrar-pessoa")}
        onAbrirPessoa={(pessoa) => abrirPessoa(pessoa.id)}
      />

      {__DEV__ && (
        <Pressable
          onPress={() => abrirPessoa("demonstracao")}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.previewButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.previewText}>
            Visualizar pessoa de exemplo · teste
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  previewButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});