import { ChevronRight, MapPin } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";
import type { PessoaResumo } from "../types/pessoa";

type CardPessoaProps = {
  pessoa: PessoaResumo;
  onPress?: () => void;
};

export default function CardPessoa({
  pessoa,
  onPress,
}: CardPessoaProps) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const iniciais = pessoa.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

  const conteudo = (
    <>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{iniciais || "?"}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{pessoa.nome}</Text>

        {pessoa.necessidadeApoio ? (
          <Text style={styles.description}>
            {pessoa.necessidadeApoio}
          </Text>
        ) : null}

        <View style={styles.location}>
          <MapPin size={15} color={colors.textSecondary} />

          <Text style={styles.locationText}>
            {pessoa.localAtual || "Endereço de referência não informado"}
          </Text>
        </View>
      </View>

      {onPress ? (
        <ChevronRight size={20} color={colors.textSecondary} />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{conteudo}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${pessoa.nome}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {conteudo}
    </Pressable>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  details: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
}));