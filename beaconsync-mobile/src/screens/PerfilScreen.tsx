import { Mail, Phone, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import type { EstadoPerfil } from "../types/perfil";

type Props = {
  onVoluntariado?: () => void;
  onEditar?: () => void;
  rotuloVoluntariado?: string;
  estado?: EstadoPerfil;
  demonstracao?: boolean;
  onTentarNovamente?: () => void;
  onVoltarLogin: () => void;
};

export default function PerfilScreen({
  estado = { status: "indisponivel" },
  demonstracao = false,
  onTentarNovamente,
  onVoltarLogin,
  onEditar,
  onVoluntariado,
  rotuloVoluntariado = "Quero ser voluntário",
}: Props) {
  const perfil =
    estado.status === "sucesso" ? estado.perfil : null;

  const [fotoFalhou, setFotoFalhou] = useState(false);

  useEffect(() => {
    setFotoFalhou(false);
  }, [perfil?.fotoUrl]);

  const iniciais = perfil?.nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu perfil</Text>

          <Text style={styles.subtitle}>
            Suas informações no BeaconSync.
          </Text>
        </View>

        {demonstracao && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Prévia de desenvolvimento: os dados abaixo são
              fictícios e não representam uma conta cadastrada.
            </Text>
          </View>
        )}

        {perfil ? (
          <>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                {perfil.fotoUrl && !fotoFalhou ? (
                  <Image
                    source={{ uri: perfil.fotoUrl }}
                    style={styles.photo}
                    onError={() => setFotoFalhou(true)}
                    accessibilityLabel={`Foto de ${perfil.nome}`}
                  />
                ) : (
                  <Text style={styles.initials}>
                    {iniciais || "?"}
                  </Text>
                )}
              </View>

              <Text style={styles.name}>{perfil.nome}</Text>

              <Text style={styles.identityDescription}>
                Sua conta para acompanhar quem precisa de você.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Informações da conta
              </Text>

              <View style={styles.field}>
                <UserRound
                  size={21}
                  color={colors.primary}
                />

                <View style={styles.fieldContent}>
                  <Text style={styles.label}>Nome completo</Text>
                  <Text style={styles.value}>{perfil.nome}</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.field}>
                <Mail size={21} color={colors.primary} />

                <View style={styles.fieldContent}>
                  <Text style={styles.label}>E-mail</Text>
                  <Text style={styles.value} selectable>
                    {perfil.email}
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.field}>
                <Phone size={21} color={colors.primary} />

                <View style={styles.fieldContent}>
                  <Text style={styles.label}>Telefone</Text>
                  <Text style={styles.value} selectable>
                    {perfil.telefone?.trim() || "Não informado"}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.messageCard}>
            {estado.status === "carregando" ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            ) : (
              <UserRound size={36} color={colors.primary} />
            )}

            <Text style={styles.messageTitle}>
              {estado.status === "carregando"
                ? "Carregando perfil"
                : estado.status === "erro"
                  ? "Não foi possível carregar"
                  : "Informações indisponíveis"}
            </Text>

            <Text style={styles.messageDescription}>
              {estado.status === "carregando"
                ? "Aguarde enquanto buscamos suas informações."
                : estado.status === "erro"
                  ? estado.mensagem
                  : "Suas informações aparecerão aqui quando sua conta estiver disponível."}
            </Text>

            {estado.status === "erro" && onTentarNovamente && (
              <Pressable
                onPress={onTentarNovamente}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.retryText}>
                  Tentar novamente
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {perfil && onEditar && (
  <Pressable
    onPress={onEditar}
    accessibilityRole="button"
    style={({ pressed }) => [
      styles.editButton,
      pressed && styles.pressed,
    ]}
  >
    <Text style={styles.editButtonText}>
      Editar perfil
    </Text>
  </Pressable>
)}  

      {perfil && onVoluntariado && (
  <Pressable
    onPress={onVoluntariado}
    accessibilityRole="button"
    style={({ pressed }) => [
      styles.editButton,
      pressed && styles.pressed,
    ]}
  >
    <Text style={styles.editButtonText}>
     {rotuloVoluntariado}
    </Text>
  </Pressable>
)}
        <View style={styles.aboutCard}>
          <Text style={styles.cardTitle}>BeaconSync</Text>

          <Text style={styles.messageDescription}>
            Conectando cuidado. Acompanhe pessoas, consulte
            alertas e mantenha as informações de apoio atualizadas.
          </Text>
        </View>

        <Pressable
          onPress={onVoltarLogin}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.loginText}>
            Voltar para o login
          </Text>
        </Pressable>
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
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    gap: 8,
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
  infoBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
    borderWidth: 1,
    borderColor: colors.infoBorder,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.infoText,
  },
  identity: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  initials: {
    fontSize: 32,
    fontWeight: "600",
    color: colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  identityDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    gap: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  field: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  fieldContent: {
    flex: 1,
    gap: 5,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  messageCard: {
    alignItems: "center",
    padding: 24,
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  messageDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  aboutCard: {
    padding: 20,
    gap: 10,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
  },
  retryButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
  },
  loginButton: {
    minHeight: 52,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  editButton: {
  minHeight: 52,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.primary,
  backgroundColor: colors.surface,
  alignItems: "center",
  justifyContent: "center",
},
editButtonText: {
  fontSize: 15,
  fontWeight: "600",
  color: colors.primary,
},
});