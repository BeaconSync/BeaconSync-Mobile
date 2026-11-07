import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

type InicioScreenProps = {
  nomeUsuario?: string;
};

export default function InicioScreen({
  nomeUsuario,
}: InicioScreenProps) {
  const nome = nomeUsuario?.trim();
  const primeiroNome = nome?.split(/\s+/)[0];

  const iniciais = nome
    ? nome
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase()
    : "—";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandInitials}>BS</Text>
            </View>

            <View>
              <Text style={styles.brandName}>BeaconSync</Text>
              <Text style={styles.brandSubtitle}>
                Conectando cuidado
              </Text>
            </View>
          </View>

          <View
            style={styles.avatar}
            accessibilityLabel={nome ?? "Perfil"}
          >
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.title}>
            {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
          </Text>

          <Text style={styles.subtitle}>
            Acompanhe quem precisa de você.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Áreas acompanhadas
          </Text>

          <Text style={styles.infoDescription}>
            As informações sobre alertas ainda não estão disponíveis.
          </Text>

          <Text style={styles.infoFootnote}>
            A ausência de informação não confirma segurança.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pessoas acompanhadas
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>
            Informações indisponíveis
          </Text>

          <Text style={styles.placeholderDescription}>
            As pessoas que você acompanha aparecerão aqui quando
            os dados estiverem disponíveis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  brandInitials: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  brandName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  greeting: {
    marginTop: 28,
    marginBottom: 24,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.infoBackground,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.infoText,
  },
  infoDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  infoFootnote: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: colors.infoText,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  placeholderDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});