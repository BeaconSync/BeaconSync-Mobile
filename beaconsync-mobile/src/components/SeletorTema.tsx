import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useTema,
  usarEstilosTema,
  type Cores,
  type PreferenciaTema,
} from "../theme/tema";

const opcoes: {
  valor: PreferenciaTema;
  titulo: string;
  descricao: string;
}[] = [
  {
    valor: "automatico",
    titulo: "Automático",
    descricao: "Acompanha a aparência do celular.",
  },
  {
    valor: "claro",
    titulo: "Claro",
    descricao: "Fundos claros e detalhes em dourado.",
  },
  {
    valor: "escuro",
    titulo: "Escuro",
    descricao: "Fundos escuros e textos claros.",
  },
];

export default function SeletorTema() {
  const {
    colors,
    preferencia,
    pronto,
    salvando,
    erro,
    alterarTema,
  } = useTema();

  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Aparência</Text>

      <Text style={styles.description}>
        Escolha como você prefere visualizar o BeaconSync.
      </Text>

      <View accessibilityRole="radiogroup">
        {opcoes.map((opcao) => {
          const selecionada =
            preferencia === opcao.valor;

          return (
            <Pressable
              key={opcao.valor}
              disabled={!pronto || salvando}
              accessibilityRole="radio"
              accessibilityLabel={opcao.titulo}
              accessibilityState={{
                checked: selecionada,
                disabled: !pronto || salvando,
              }}
              onPress={() => {
                void alterarTema(opcao.valor);
              }}
              style={({ pressed }) => [
                styles.option,
                selecionada && styles.selected,
                (pressed || salvando) && styles.dimmed,
              ]}
            >
              <View
                style={[
                  styles.radio,
                  selecionada && styles.radioSelected,
                ]}
              >
                {selecionada && (
                  <View style={styles.radioDot} />
                )}
              </View>

              <View style={styles.details}>
                <Text style={styles.optionTitle}>
                  {opcao.titulo}
                </Text>

                <Text style={styles.description}>
                  {opcao.descricao}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {salvando && (
        <View style={styles.saving}>
          <ActivityIndicator color={colors.primary} />

          <Text style={styles.description}>
            Salvando aparência...
          </Text>
        </View>
      )}

      {erro && (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {erro}
        </Text>
      )}
    </View>
  );
}

const criarStyles = (colors: Cores) =>
  StyleSheet.create({
    card: {
      padding: 18,
      gap: 12,
      marginBottom: 24,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 19,
      fontWeight: "600",
      color: colors.text,
    },
    description: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    option: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    selected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    details: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    saving: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    error: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.danger,
    },
    dimmed: {
      opacity: 0.65,
    },
  });