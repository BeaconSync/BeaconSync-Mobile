import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import type { TextInputProps } from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { useVoluntarioForm } from "../hooks/useVoluntarioForm";
import { colors } from "../theme/colors";

import type { DadosPerfil } from "../types/perfil";

import {
  especialidadesVoluntario,
  type EnviarCadastroVoluntario,
} from "../types/voluntario";

type Props = {
  perfil: DadosPerfil;
  demonstracao?: boolean;
  onFechar: () => void;
  onCadastrar?: EnviarCadastroVoluntario;
};

export default function CadastroVoluntarioScreen({
  perfil,
  demonstracao = false,
  onFechar,
  onCadastrar,
}: Props) {
  const {
    dados,
    enviando,
    concluido,
    erro,
    alterarCampo,
    enviar,
  } = useVoluntarioForm(perfil.telefone, onCadastrar);

  function fechar() {
    if (enviando) return;

    Keyboard.dismiss();
    onFechar();
  }

  async function confirmar() {
    Keyboard.dismiss();
    await enviar();
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={fechar}
    >
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={styles.container}
          edges={["top", "bottom", "left", "right"]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Voluntariado
            </Text>

            <Pressable
              onPress={fechar}
              disabled={enviando}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                (pressed || enviando) && styles.disabled,
              ]}
            >
              <Text style={styles.closeText}>
                {concluido ? "Fechar" : "Voltar"}
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
                  fictícia. O cadastro ainda não está conectado.
                </Text>
              </View>
            )}

            {concluido ? (
              <>
                <Text style={styles.title}>
                  Cadastro registrado
                </Text>

                <Text style={styles.description}>
                  Suas informações de voluntariado foram salvas.
                </Text>

                <Pressable
                  onPress={fechar}
                  accessibilityRole="button"
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryText}>
                    Voltar para o perfil
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.title}>
                    Quero ajudar
                  </Text>

                  <Text style={styles.description}>
                    Informe onde você pode atuar e como deseja
                    contribuir no apoio às pessoas afetadas
                    por enchentes.
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    Sua conta
                  </Text>

                  <Text style={styles.accountName}>
                    {perfil.nome}
                  </Text>

                  <Text style={styles.description} selectable>
                    {perfil.email}
                  </Text>
                </View>

                <Campo
                  rotulo="Telefone de contato"
                  value={dados.telefone}
                  onChangeText={(valor) =>
                    alterarCampo("telefone", valor)
                  }
                  editable={!enviando}
                  maxLength={25}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Região de atuação
                  </Text>

                  <Campo
                    rotulo="Cidade"
                    value={dados.cidade}
                    onChangeText={(valor) =>
                      alterarCampo("cidade", valor)
                    }
                    editable={!enviando}
                    maxLength={100}
                    autoCapitalize="words"
                    placeholder="Nome da cidade"
                  />

                  <Campo
                    rotulo="Estado (UF)"
                    value={dados.uf}
                    onChangeText={(valor) =>
                      alterarCampo(
                        "uf",
                        valor
                          .replace(/[^a-z]/gi, "")
                          .toUpperCase()
                          .slice(0, 2)
                      )
                    }
                    editable={!enviando}
                    maxLength={2}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    placeholder="Ex.: SP"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Como você deseja ajudar?
                  </Text>

                  <Text style={styles.description}>
                    Selecione sua principal área de atuação.
                  </Text>

                  {especialidadesVoluntario.map((opcao) => {
                    const selecionada =
                      dados.especialidade === opcao;

                    return (
                      <Pressable
                        key={opcao}
                        onPress={() =>
                          alterarCampo("especialidade", opcao)
                        }
                        disabled={enviando}
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked: selecionada,
                          disabled: enviando,
                        }}
                        style={({ pressed }) => [
                          styles.option,
                          selecionada && styles.optionSelected,
                          (pressed || enviando) &&
                            styles.disabled,
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

                        <Text style={styles.optionText}>
                          {opcao}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {dados.especialidade === "Outro" && (
                    <Campo
                      rotulo="Como você pode ajudar?"
                      value={dados.outraEspecialidade}
                      onChangeText={(valor) =>
                        alterarCampo("outraEspecialidade", valor)
                      }
                      editable={!enviando}
                      maxLength={150}
                      placeholder="Descreva sua área de apoio"
                    />
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.availabilityRow}>
                    <Text style={styles.availabilityTitle}>
                      Disponível para ajudar
                    </Text>

                    <Switch
                      value={dados.disponivel}
                      onValueChange={(valor) =>
                        alterarCampo("disponivel", valor)
                      }
                      disabled={enviando}
                      accessibilityLabel="Disponível para ajudar"
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                    />
                  </View>

                  <Text style={styles.description}>
                    {dados.disponivel
                      ? "Você está informando disponibilidade para participar de ações de apoio."
                      : "Você pode cadastrar seu interesse mesmo sem disponibilidade no momento."}
                  </Text>
                </View>

                <Campo
                  rotulo="Observações (opcional)"
                  value={dados.observacoes}
                  onChangeText={(valor) =>
                    alterarCampo("observacoes", valor)
                  }
                  editable={!enviando}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                  placeholder="Ex.: posso ajudar aos finais de semana."
                  style={styles.multiline}
                />

                {erro && (
                  <View
                    style={styles.errorBox}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Text style={styles.errorText}>
                      {erro}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={confirmar}
                  disabled={enviando}
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: enviando,
                    busy: enviando,
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || enviando) && styles.disabled,
                  ]}
                >
                  {enviando && (
                    <ActivityIndicator color={colors.surface} />
                  )}

                  <Text style={styles.primaryText}>
                    {enviando
                      ? "Enviando..."
                      : "Cadastrar como voluntário"}
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

type CampoProps = TextInputProps & {
  rotulo: string;
};

function Campo({ rotulo, style, ...props }: CampoProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{rotulo}</Text>

      <TextInput
        {...props}
        accessibilityLabel={rotulo}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  closeText: {
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
    gap: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: "600",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  accountName: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.text,
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
  multiline: {
    minHeight: 110,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  availabilityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
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
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.surface,
  },
  disabled: {
    opacity: 0.6,
  },
});