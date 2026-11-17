import {
  useEffect,
  useRef,
  type ComponentRef,
} from "react";

import { Stack } from "expo-router";

import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import CampoFormulario from "../components/CampoFormulario";

import {
  useEditarPessoa,
} from "../hooks/useEditarPessoa";

import {
  categoriasVulnerabilidade,
} from "../utils/validarCadatroJava";

import { colors } from "../theme/colors";

import type {
  PessoaDetalhes,
} from "../types/detalhaPessoa";

import type {
  SalvarEdicaoPessoa,
} from "../types/editarPessoa";

type Props = {
  pessoa: PessoaDetalhes;
  demonstracao?: boolean;
  onCancelar: () => void;
  onConcluido: () => void;
  onSalvar?: SalvarEdicaoPessoa;
};

export default function EditarPessoaScreen({
  pessoa,
  demonstracao = false,
  onCancelar,
  onConcluido,
  onSalvar,
}: Props) {
  const {
    dados,
    erros,
    erroEnvio,
    enviando,
    alterar,
    salvar,
  } = useEditarPessoa(
    pessoa,
    demonstracao ? undefined : onSalvar
  );

  const scroll =
    useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const listener = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!enviando) {
          onCancelar();
        }

        return true;
      }
    );

    return () => listener.remove();
  }, [enviando, onCancelar]);

  function cancelar() {
    if (enviando) return;

    Keyboard.dismiss();
    onCancelar();
  }

  async function confirmar() {
    Keyboard.dismiss();

    const sucesso = await salvar();

    if (sucesso) {
      onConcluido();
    } else {
      scroll.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Editar pessoa",
          headerShown: true,
          headerBackVisible: false,
          gestureEnabled: false,

          headerLeft: () => (
            <Pressable
              onPress={cancelar}
              disabled={enviando}
              accessibilityRole="button"
              style={styles.headerButton}
            >
              <Text style={styles.link}>
                Cancelar
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.title}>
          Atualizar informações
        </Text>

        <Text style={styles.description}>
          Revise o nome, a data de nascimento e as
          necessidades de apoio da pessoa.
        </Text>

        {demonstracao && (
          <View style={styles.notice}>
            <Text style={styles.description}>
              Prévia de desenvolvimento: você pode
              alterar os campos, mas nenhuma alteração
              será enviada ou salva.
            </Text>
          </View>
        )}

        {erroEnvio && (
          <Text
            style={styles.error}
            accessibilityRole="alert"
          >
            {erroEnvio}
          </Text>
        )}

        {Object.values(erros).some(Boolean) && (
          <Text style={styles.error}>
            Confira os campos indicados.
          </Text>
        )}

        <CampoFormulario
          label="Nome completo"
          value={dados.nome}
          onChangeText={(valor) =>
            alterar("nome", valor)
          }
          maxLength={120}
          autoCapitalize="words"
          editable={!enviando}
          erro={erros.nome}
        />

        <CampoFormulario
          label="Data de nascimento"
          value={dados.dataNascimento}
          onChangeText={(valor) =>
            alterar(
              "dataNascimento",
              valor
                .replace(/\D/g, "")
                .slice(0, 8)
                .replace(/^(\d{2})(\d)/, "$1/$2")
                .replace(
                  /^(\d{2})\/(\d{2})(\d)/,
                  "$1/$2/$3"
                )
            )
          }
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
          editable={!enviando}
          erro={erros.dataNascimento}
        />

        <Text style={styles.label}>
          Categoria principal
        </Text>

        <View style={styles.options}>
          {categoriasVulnerabilidade.map((categoria) => {
            const selecionada =
              dados.tipoVulnerabilidade ===
              categoria.valor;

            return (
              <Pressable
                key={categoria.valor}
                disabled={enviando}
                onPress={() =>
                  alterar(
                    "tipoVulnerabilidade",
                    categoria.valor
                  )
                }
                accessibilityRole="radio"
                accessibilityState={{
                  checked: selecionada,
                  disabled: enviando,
                }}
                style={({ pressed }) => [
                  styles.option,
                  selecionada && styles.selected,
                  (pressed || enviando) &&
                    styles.dimmed,
                ]}
              >
                <Text style={styles.optionText}>
                  {selecionada ? "● " : "○ "}
                  {categoria.titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {erros.tipoVulnerabilidade && (
          <Text style={styles.error}>
            {erros.tipoVulnerabilidade}
          </Text>
        )}

        <CampoFormulario
          label="Apoio necessário para deslocamento (opcional)"
          value={dados.necessidadesRemocao}
          onChangeText={(valor) =>
            alterar("necessidadesRemocao", valor)
          }
          placeholder="Ex.: cadeira de rodas, maca ou ajuda para sair de casa."
          maxLength={500}
          multiline
          editable={!enviando}
          erro={erros.necessidadesRemocao}
        />

        <Pressable
          onPress={() => {
            void confirmar();
          }}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityState={{
            disabled: enviando,
            busy: enviando,
          }}
          style={({ pressed }) => [
            styles.saveButton,
            (pressed || enviando) && styles.dimmed,
          ]}
        >
          {enviando && (
            <ActivityIndicator
              color={colors.surface}
            />
          )}

          <Text style={styles.saveText}>
            {enviando
              ? "Salvando..."
              : "Salvar alterações"}
          </Text>
        </Pressable>

        <Pressable
          onPress={cancelar}
          disabled={enviando}
          accessibilityRole="button"
          style={styles.cancelButton}
        >
          <Text style={styles.link}>
            Cancelar
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
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  options: {
    gap: 10,
    marginBottom: 20,
  },
  option: {
    minHeight: 50,
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  notice: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginBottom: 20,
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.warningText,
    marginBottom: 16,
  },
  saveButton: {
    minHeight: 52,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  cancelButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  headerButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingRight: 12,
  },
  link: {
    fontSize: 15,
    color: colors.primary,
  },
  dimmed: {
    opacity: 0.6,
  },
});