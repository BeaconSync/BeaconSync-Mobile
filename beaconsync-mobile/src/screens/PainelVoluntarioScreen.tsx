import { useState } from "react";

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

import MapaMonitoramentoScreen from "./MapaMonitoramentoScreen";

import { useDisponibilidadeVoluntario } from "../hooks/useDisponibilidadeVoluntario";
import { useVoluntarioForm } from "../hooks/useVoluntarioForm";
import { colors } from "../theme/colors";

import type {
  EstadoMonitoramento,
} from "../types/monitoramento";

import {
  especialidadesVoluntario,
  type AtualizarDisponibilidadeVoluntario,
  type EstadoVoluntario,
  type SalvarDadosVoluntario,
  type Voluntario,
} from "../types/voluntario";

type Props = {
  nomeUsuario: string;
  estado?: EstadoVoluntario;
  demonstracao?: boolean;
  onFechar: () => void;
  onAtualizado: (voluntario: Voluntario) => void;
  onAtualizarDisponibilidade?: AtualizarDisponibilidadeVoluntario;
  onSalvarEdicao?: SalvarDadosVoluntario;
  onTentarNovamente?: () => void;

  estadoMapa?: EstadoMonitoramento;
  onAtualizarMapa?: () => void;
};

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PainelVoluntarioScreen({
  nomeUsuario,
  estado = { status: "indisponivel" },
  demonstracao = false,
  onFechar,
  onAtualizado,
  onAtualizarDisponibilidade,
  onSalvarEdicao,
  onTentarNovamente,
  estadoMapa,
  onAtualizarMapa,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [vendoMapa, setVendoMapa] = useState(false);

  const disponibilidade = useDisponibilidadeVoluntario(
    onAtualizarDisponibilidade
  );

  const voluntario =
    estado.status === "sucesso"
      ? estado.voluntario
      : null;

  const formulario = useVoluntarioForm(
    null,
    onSalvarEdicao && voluntario
      ? async (dados) => {
          const atualizado = await onSalvarEdicao(
            voluntario.id,
            dados
          );

          if (atualizado?.id !== voluntario.id) {
            throw new Error(
              "Resposta de atualização inválida."
            );
          }

          onAtualizado(atualizado);
        }
      : undefined,
    true
  );

  const { dados } = formulario;

  const bloqueado =
    disponibilidade.enviando || formulario.enviando;

  function fechar() {
    if (bloqueado) return;

    Keyboard.dismiss();

    if (vendoMapa) {
      setVendoMapa(false);
      return;
    }

    if (editando) {
      setEditando(false);
      return;
    }

    onFechar();
  }

  function iniciarEdicao() {
    if (!voluntario || bloqueado) return;

    formulario.preencher(voluntario);
    setEditando(true);
  }

  async function salvarEdicao() {
    if (bloqueado) return;

    Keyboard.dismiss();

    const sucesso = await formulario.enviar();

    if (sucesso) {
      setEditando(false);
    }
  }

  async function alterarDisponibilidade(valor: boolean) {
    if (!voluntario || bloqueado) return;

    const atualizado = await disponibilidade.atualizar(
      voluntario,
      valor
    );

    if (atualizado) {
      onAtualizado(atualizado);
    }
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
              {vendoMapa
                ? "Mapa de apoio"
                : editando
                  ? "Editar voluntariado"
                  : "Meu voluntariado"}
            </Text>

            <Pressable
              onPress={fechar}
              disabled={bloqueado}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                (pressed || bloqueado) && styles.disabled,
              ]}
            >
              <Text style={styles.closeText}>
                {vendoMapa
                  ? "Voltar"
                  : editando
                    ? "Cancelar"
                    : "Fechar"}
              </Text>
            </Pressable>
          </View>

          {vendoMapa ? (
            <MapaMonitoramentoScreen
              demonstracao={demonstracao}
              estado={estadoMapa}
              onAtualizar={onAtualizarMapa}
            />
          ) : (
            <ScrollView
              key={editando ? "edicao" : "painel"}
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
                    Prévia de desenvolvimento: este cadastro
                    é fictício. As alterações ainda não podem
                    ser gravadas.
                  </Text>
                </View>
              )}

              {voluntario ? (
                editando ? (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.title}>
                        Atualize suas informações
                      </Text>

                      <Text style={styles.description}>
                        Revise seu contato, sua região de
                        atuação e como você deseja ajudar.
                      </Text>
                    </View>

                    <Campo
                      rotulo="Telefone de contato"
                      value={dados.telefone}
                      onChangeText={(valor) =>
                        formulario.alterarCampo(
                          "telefone",
                          valor
                        )
                      }
                      editable={!bloqueado}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      maxLength={25}
                      placeholder="(11) 99999-9999"
                    />

                    <Campo
                      rotulo="Cidade de atuação"
                      value={dados.cidade}
                      onChangeText={(valor) =>
                        formulario.alterarCampo(
                          "cidade",
                          valor
                        )
                      }
                      editable={!bloqueado}
                      autoCapitalize="words"
                      maxLength={100}
                      placeholder="Nome da cidade"
                    />

                    <Campo
                      rotulo="Estado (UF)"
                      value={dados.uf}
                      onChangeText={(valor) =>
                        formulario.alterarCampo(
                          "uf",
                          valor
                            .replace(/[^a-z]/gi, "")
                            .toUpperCase()
                            .slice(0, 2)
                        )
                      }
                      editable={!bloqueado}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={2}
                      placeholder="Ex.: SP"
                    />

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Área principal de atuação
                      </Text>

                      {especialidadesVoluntario.map(
                        (opcao) => {
                          const selecionada =
                            dados.especialidade === opcao;

                          return (
                            <Pressable
                              key={opcao}
                              onPress={() =>
                                formulario.alterarCampo(
                                  "especialidade",
                                  opcao
                                )
                              }
                              disabled={bloqueado}
                              accessibilityRole="radio"
                              accessibilityState={{
                                checked: selecionada,
                                disabled: bloqueado,
                              }}
                              style={({ pressed }) => [
                                styles.option,
                                selecionada &&
                                  styles.optionSelected,
                                (pressed || bloqueado) &&
                                  styles.disabled,
                              ]}
                            >
                              <View
                                style={[
                                  styles.radio,
                                  selecionada &&
                                    styles.radioSelected,
                                ]}
                              >
                                {selecionada && (
                                  <View
                                    style={styles.radioDot}
                                  />
                                )}
                              </View>

                              <Text style={styles.optionText}>
                                {opcao}
                              </Text>
                            </Pressable>
                          );
                        }
                      )}
                    </View>

                    {dados.especialidade === "Outro" && (
                      <Campo
                        rotulo="Como você pode ajudar?"
                        value={dados.outraEspecialidade}
                        onChangeText={(valor) =>
                          formulario.alterarCampo(
                            "outraEspecialidade",
                            valor
                          )
                        }
                        editable={!bloqueado}
                        maxLength={150}
                        placeholder="Descreva sua área de apoio"
                      />
                    )}

                    <View style={styles.card}>
                      <View style={styles.availabilityRow}>
                        <Text
                          style={styles.availabilityTitle}
                        >
                          Disponível para ajudar
                        </Text>

                        <Switch
                          value={dados.disponivel}
                          onValueChange={(valor) =>
                            formulario.alterarCampo(
                              "disponivel",
                              valor
                            )
                          }
                          disabled={bloqueado}
                          accessibilityLabel="Disponível para ajudar"
                          trackColor={{
                            false: colors.border,
                            true: colors.primary,
                          }}
                        />
                      </View>

                      <Text style={styles.description}>
                        Esta alteração será enviada junto
                        com os demais dados ao salvar.
                      </Text>
                    </View>

                    <Campo
                      rotulo="Observações (opcional)"
                      value={dados.observacoes}
                      onChangeText={(valor) =>
                        formulario.alterarCampo(
                          "observacoes",
                          valor
                        )
                      }
                      editable={!bloqueado}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                      placeholder="Ex.: disponibilidade aos finais de semana."
                      style={styles.multiline}
                    />

                    {formulario.erro && (
                      <MensagemErro
                        texto={formulario.erro}
                      />
                    )}

                    <Pressable
                      onPress={salvarEdicao}
                      disabled={bloqueado}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: bloqueado,
                        busy: formulario.enviando,
                      }}
                      style={({ pressed }) => [
                        styles.button,
                        (pressed || bloqueado) &&
                          styles.disabled,
                      ]}
                    >
                      {formulario.enviando && (
                        <ActivityIndicator
                          color={colors.surface}
                        />
                      )}

                      <Text style={styles.buttonText}>
                        {formulario.enviando
                          ? "Salvando..."
                          : "Salvar alterações"}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.title}>
                        Olá, {nomeUsuario}
                      </Text>

                      <Text style={styles.description}>
                        Consulte suas informações e mantenha
                        sua disponibilidade atualizada.
                      </Text>
                    </View>

                    <View style={styles.card}>
                      <View style={styles.availabilityRow}>
                        <Text
                          style={styles.availabilityTitle}
                        >
                          Disponível para ajudar
                        </Text>

                        <Switch
                          value={voluntario.disponivel}
                          onValueChange={
                            alterarDisponibilidade
                          }
                          disabled={bloqueado}
                          accessibilityLabel="Disponível para ajudar"
                          accessibilityState={{
                            disabled: bloqueado,
                            busy: disponibilidade.enviando,
                          }}
                          trackColor={{
                            false: colors.border,
                            true: colors.primary,
                          }}
                        />
                      </View>

                      <Text style={styles.description}>
                        {voluntario.disponivel
                          ? "Sua disponibilidade está registrada como ativa."
                          : "Você informou que não está disponível no momento."}
                      </Text>

                      {disponibilidade.enviando && (
                        <View style={styles.loadingRow}>
                          <ActivityIndicator
                            color={colors.primary}
                          />

                          <Text style={styles.description}>
                            Atualizando disponibilidade...
                          </Text>
                        </View>
                      )}

                      {disponibilidade.erro && (
                        <MensagemErro
                          texto={disponibilidade.erro}
                        />
                      )}
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionTitle}>
                        Região de atuação
                      </Text>

                      <Informacao
                        rotulo="Cidade"
                        valor={voluntario.cidade}
                      />

                      <Informacao
                        rotulo="Estado"
                        valor={voluntario.uf}
                      />
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionTitle}>
                        Como você pode ajudar
                      </Text>

                      <Informacao
                        rotulo="Área principal"
                        valor={
                          voluntario.especialidade === "Outro"
                            ? voluntario.outraEspecialidade ||
                              "Outra área não especificada"
                            : voluntario.especialidade
                        }
                      />

                      <Informacao
                        rotulo="Telefone de contato"
                        valor={voluntario.telefone}
                      />

                      {voluntario.observacoes.trim() ? (
                        <Informacao
                          rotulo="Observações"
                          valor={voluntario.observacoes}
                        />
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => setVendoMapa(true)}
                      disabled={bloqueado}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.button,
                        (pressed || bloqueado) &&
                          styles.disabled,
                      ]}
                    >
                      <Text style={styles.buttonText}>
                        Abrir mapa de apoio
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={iniciarEdicao}
                      disabled={bloqueado}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.editButton,
                        (pressed || bloqueado) &&
                          styles.disabled,
                      ]}
                    >
                      <Text style={styles.editText}>
                        Editar voluntariado
                      </Text>
                    </Pressable>

                    <Text style={styles.updatedText}>
                      Última atualização:{" "}
                      {formatarData(
                        voluntario.atualizadoEm
                      )}
                    </Text>
                  </>
                )
              ) : (
                <View style={styles.card}>
                  {estado.status === "carregando" && (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                    />
                  )}

                  <Text style={styles.sectionTitle}>
                    {estado.status === "carregando"
                      ? "Carregando cadastro"
                      : estado.status === "erro"
                        ? "Não foi possível carregar"
                        : "Informações indisponíveis"}
                  </Text>

                  <Text style={styles.description}>
                    {estado.status === "carregando"
                      ? "Aguarde enquanto buscamos suas informações."
                      : estado.status === "erro"
                        ? estado.mensagem
                        : "Ainda não foi possível consultar seu cadastro de voluntário."}
                  </Text>

                  {estado.status === "erro" &&
                    onTentarNovamente && (
                      <Pressable
                        onPress={onTentarNovamente}
                        accessibilityRole="button"
                        style={styles.button}
                      >
                        <Text style={styles.buttonText}>
                          Tentar novamente
                        </Text>
                      </Pressable>
                    )}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

type CampoProps = TextInputProps & {
  rotulo: string;
};

function Campo({
  rotulo,
  style,
  ...props
}: CampoProps) {
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

function Informacao({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{rotulo}</Text>
      <Text style={styles.value}>{valor}</Text>
    </View>
  );
}

function MensagemErro({ texto }: { texto: string }) {
  return (
    <View
      style={styles.errorBox}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.errorText}>{texto}</Text>
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
    paddingHorizontal: 8,
    justifyContent: "center",
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
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  card: {
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  availabilityTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    lineHeight: 24,
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
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  updatedText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  button: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  editButton: {
    minHeight: 52,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});