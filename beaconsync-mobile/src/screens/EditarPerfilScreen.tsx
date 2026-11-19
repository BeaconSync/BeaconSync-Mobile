import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
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

import { useEditarPerfil } from "../hooks/useEditarPerfil";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

import type {
  DadosPerfil,
  SalvarPerfil,
} from "../types/perfil";

type Props = {
  perfil: DadosPerfil;
  demonstracao?: boolean;
  onCancelar: () => void;
  onConcluido: (perfil: DadosPerfil) => void;
  onSalvar?: SalvarPerfil;
};

export default function EditarPerfilScreen({
  perfil,
  demonstracao = false,
  onCancelar,
  onConcluido,
  onSalvar,
}: Props) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

 const {
  nome,
  email,
  telefone,
  fotoPreview,
  papel,
  podeAlterarPapel,
  enviando,
  escolhendoFoto,
  bloqueado,
  erro,
  alterarNome,
  alterarEmail,
  alterarTelefone,
  alterarPapel,
  escolherFoto,
  removerFoto,
  salvar,
} = useEditarPerfil(perfil, onSalvar);

  const [fotoFalhou, setFotoFalhou] = useState(false);

  useEffect(() => {
    setFotoFalhou(false);
  }, [fotoPreview]);

  const iniciais = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  function cancelar() {
    if (bloqueado) return;

    Keyboard.dismiss();
    onCancelar();
  }

  async function confirmar() {
    if (bloqueado) return;

    Keyboard.dismiss();

    const atualizado = await salvar();

    if (atualizado) {
      onConcluido(atualizado);
    }
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={cancelar}
    >
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={styles.container}
          edges={["top", "bottom", "left", "right"]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Editar perfil
            </Text>

            <Pressable
              onPress={cancelar}
              disabled={bloqueado}
              accessibilityRole="button"
              accessibilityState={{ disabled: bloqueado }}
              style={({ pressed }) => [
                styles.headerButton,
                (pressed || bloqueado) && styles.disabled,
              ]}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            {demonstracao && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Prévia de desenvolvimento: esta conta é
                  fictícia. A gravação ainda não está disponível.
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.title}>
                Suas informações
              </Text>

              <Text style={styles.description}>
                Atualize sua foto, seu nome e seu telefone.
              </Text>
            </View>

            <View style={styles.photoSection}>
              <View style={styles.avatar}>
                {fotoPreview && !fotoFalhou ? (
                  <Image
                    source={{ uri: fotoPreview }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => setFotoFalhou(true)}
                    accessibilityLabel="Prévia da foto de perfil"
                  />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {iniciais || "?"}
                  </Text>
                )}
              </View>

              <Pressable
                onPress={escolherFoto}
                disabled={bloqueado}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: bloqueado,
                  busy: escolhendoFoto,
                }}
                style={({ pressed }) => [
                  styles.photoButton,
                  (pressed || bloqueado) && styles.disabled,
                ]}
              >
                {escolhendoFoto && (
                  <ActivityIndicator color={colors.primary} />
                )}

                <Text style={styles.photoButtonText}>
                  {escolhendoFoto
                    ? "Abrindo galeria..."
                    : fotoPreview
                      ? "Alterar foto"
                      : "Adicionar foto"}
                </Text>
              </Pressable>

              {fotoPreview && (
                <Pressable
                  onPress={removerFoto}
                  disabled={bloqueado}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: bloqueado }}
                  style={({ pressed }) => [
                    styles.removePhotoButton,
                    (pressed || bloqueado) && styles.disabled,
                  ]}
                >
                  <Text style={styles.removePhotoText}>
                    Remover foto
                  </Text>
                </Pressable>
              )}

              <Text style={styles.photoHelp}>
                {fotoFalhou
                  ? "Não foi possível visualizar a imagem. Selecione outra foto."
                  : "Opcional. Sem foto, usamos as iniciais do seu nome."}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Nome</Text>

              <TextInput
                value={nome}
                onChangeText={alterarNome}
                editable={!bloqueado}
                maxLength={120}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                placeholder="Digite seu nome"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Nome"
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Telefone
              </Text>

              <TextInput
                value={telefone}
                onChangeText={alterarTelefone}
                editable={!bloqueado}
                maxLength={25}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Telefone com DDD"
                style={styles.input}
              />

              <Text style={styles.helper}>
                Informe um telefone brasileiro com DDD.
              </Text>
            </View>

            {podeAlterarPapel && (
  <View style={styles.section}>
    <Text style={styles.label}>
      Tipo de perfil
    </Text>

    <Text style={styles.helper}>
      Os dois tipos podem cadastrar e acompanhar pessoas.
    </Text>

    {(
      [
        {
          valor: "RESPONSAVEL",
          titulo: "Responsável",
          descricao:
            "Acompanhe familiares e outras pessoas com quem você tem vínculo.",
        },
        {
          valor: "VOLUNTARIO",
          titulo: "Voluntário",
          descricao:
            "Além de acompanhar pessoas, participe das atividades de voluntariado.",
        },
      ] as const
    ).map((opcao) => {
      const selecionado = papel === opcao.valor;

      return (
        <Pressable
          key={opcao.valor}
          onPress={() => alterarPapel(opcao.valor)}
          disabled={bloqueado}
          accessibilityRole="radio"
          accessibilityLabel={opcao.titulo}
          accessibilityState={{
            checked: selecionado,
            disabled: bloqueado,
          }}
          style={({ pressed }) => [
            styles.roleOption,
            selecionado && styles.roleOptionSelected,
            (pressed || bloqueado) && styles.disabled,
          ]}
        >
          <View
            style={[
              styles.roleRadio,
              selecionado && styles.roleRadioSelected,
            ]}
          >
            {selecionado && (
              <View style={styles.roleRadioDot} />
            )}
          </View>

          <View style={styles.roleTexts}>
            <Text style={styles.label}>
              {opcao.titulo}
            </Text>

            <Text style={styles.helper}>
              {opcao.descricao}
            </Text>
          </View>
        </Pressable>
      );
    })}

    {papel !== perfil.papel && (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Seus vínculos e históricos serão mantidos.
          A disponibilidade de voluntário ficará pausada
          após a troca.
        </Text>
      </View>
    )}
  </View>
)}

<View style={styles.section}>
  <Text style={styles.label}>
    E-mail da conta
  </Text>

  <TextInput
    value={email}
    onChangeText={alterarEmail}
    editable={!bloqueado}
    maxLength={160}
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    autoComplete="email"
    placeholder="seuemail@exemplo.com"
    placeholderTextColor={colors.textSecondary}
    accessibilityLabel="E-mail da conta"
    style={styles.input}
  />

  <Text style={styles.helper}>
    Após salvar, use o novo e-mail para entrar na sua conta.
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
              onPress={confirmar}
              disabled={bloqueado}
              accessibilityRole="button"
              accessibilityState={{
                disabled: bloqueado,
                busy: bloqueado,
              }}
              style={({ pressed }) => [
                styles.saveButton,
                (pressed || bloqueado) && styles.disabled,
              ]}
            >
              {enviando && (
                <ActivityIndicator color={colors.onPrimary} />
              )}

              <Text style={styles.saveText}>
                {enviando
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Text>
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
    paddingVertical: 10,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
  },
  headerButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 15,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  photoSection: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.primaryLight,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "600",
    color: colors.primary,
  },
  photoButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  removePhotoButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  removePhotoText: {
    fontSize: 14,
    color: colors.danger,
  },
  photoHelp: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: colors.textSecondary,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  emailCard: {
    padding: 18,
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  email: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  infoBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.infoText,
  },
  errorBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.dangerBackground,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.danger,
  },
  saveButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
  roleOption: {
  minHeight: 76,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  backgroundColor: colors.surface,
},
roleOptionSelected: {
  borderColor: colors.primary,
  backgroundColor: colors.primaryLight,
},
roleRadio: {
  width: 22,
  height: 22,
  borderRadius: 11,
  borderWidth: 2,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
},
roleRadioSelected: {
  borderColor: colors.primary,
},
roleRadioDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.primary,
},
roleTexts: {
  flex: 1,
  gap: 5,
},
}));