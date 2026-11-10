import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInformarSituacao } from "../hooks/useInformarsituacao";
import { colors } from "../theme/colors";
import type { PessoaDetalhes } from "../types/detalhaPessoa";
import type {
  EnviarSituacao,
  StatusInformado,
} from "../types/informarSituacao";

type Props = {
  pessoa: PessoaDetalhes;
  demonstracao?: boolean;
  onVoltar: () => void;
  onEnviar?: EnviarSituacao;
  contextoAlerta?: {
  id: string;
  titulo: string;
};
};

const opcoesSituacao: {
  valor: StatusInformado;
  titulo: string;
  descricao: string;
}[] = [
  {
    valor: "Seguro",
    titulo: "Está segura",
    descricao:
      "Você tem informação de que a pessoa está segura neste momento.",
  },
  {
    valor: "Precisa de Ajuda",
    titulo: "Precisa de ajuda",
    descricao:
      "A pessoa precisa de apoio. Descreva a necessidade na observação.",
  },
  {
    valor: "Sem Contato",
    titulo: "Sem contato",
    descricao:
      "Você não conseguiu contato para verificar a situação da pessoa.",
  },
];

export default function InformarSituacaoScreen({
  pessoa,
  demonstracao = false,
  onVoltar,
  onEnviar,
  contextoAlerta,
}: Props) {
  const {
    status,
    enderecoId,
    observacao,
    enviando,
    erro,
    selecionarStatus,
    selecionarEndereco,
    alterarObservacao,
    enviar,
  } = useInformarSituacao(
  onEnviar,
  contextoAlerta?.id ?? null
);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!enviando) onVoltar();
        return true;
      }
    );

    return () => subscription.remove();
  }, [enviando, onVoltar]);

  async function confirmar() {
    Keyboard.dismiss();

    const sucesso = await enviar();

    if (sucesso) {
      Alert.alert(
        "Situação registrada",
        "Sua informação foi enviada.",
        [{ text: "Voltar aos detalhes", onPress: onVoltar }],
        { cancelable: false }
      );
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Informar situação",
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            color: colors.text,
          },
          headerLeft: () => (
            <Pressable
              onPress={onVoltar}
              disabled={enviando}
              accessibilityRole="button"
              style={[
                styles.headerButton,
                enviando && styles.disabled,
              ]}
            >
              <Text style={styles.headerButtonText}>
                Cancelar
              </Text>
            </Pressable>
          ),
        }}
      />

      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {demonstracao && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Prévia de desenvolvimento: esta pessoa é fictícia.
                O envio ainda não está conectado.
              </Text>
            </View>
          )}

          {contextoAlerta && (
  <View style={styles.infoBox}>
    <Text style={styles.infoText}>
      Atualização referente ao alerta: {contextoAlerta.titulo}
    </Text>
  </View>
)}

          <View style={styles.section}>
            <Text style={styles.title}>
              Como {pessoa.nome} está?
            </Text>

            <Text style={styles.description}>
              Informe o que você sabe neste momento.
              Se não conseguiu contato, selecione essa opção.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Situação da pessoa
            </Text>

            {opcoesSituacao.map((opcao) => (
              <Opcao
                key={opcao.valor}
                titulo={opcao.titulo}
                descricao={opcao.descricao}
                selecionada={status === opcao.valor}
                desabilitada={enviando}
                onPress={() => selecionarStatus(opcao.valor)}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Onde a pessoa está?
            </Text>

            <Text style={styles.description}>
              Selecione um endereço somente se você tiver
              informação sobre a localização atual.
            </Text>

            {pessoa.enderecos.map((endereco) => (
              <Opcao
                key={endereco.id}
                titulo={
                  endereco.nomeLocal?.trim() ||
                  "Endereço cadastrado"
                }
                descricao={[
                  `${endereco.logradouro}, ${endereco.numero}`,
                  endereco.bairro,
                  endereco.cidade,
                  endereco.uf,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                selecionada={enderecoId === endereco.id}
                desabilitada={enviando}
                onPress={() => selecionarEndereco(endereco.id)}
              />
            ))}

            <Opcao
              titulo="Não sei informar / outro endereço"
              descricao="Se souber outro local, descreva na observação."
              selecionada={enderecoId === null}
              desabilitada={enviando}
              onPress={() => selecionarEndereco(null)}
            />

            {pessoa.enderecos.length === 0 && (
              <Text style={styles.helper}>
                Esta pessoa não possui endereços cadastrados
                disponíveis para seleção.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Observação (opcional)
            </Text>

            <TextInput
              value={observacao}
              onChangeText={alterarObservacao}
              editable={!enviando}
              multiline
              maxLength={500}
              textAlignVertical="top"
              placeholder="Ex.: está na casa de um familiar e precisa de apoio para se deslocar."
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Observação sobre a situação"
              style={styles.input}
            />

            <Text style={styles.counter}>
              {observacao.length}/500
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Registrar uma situação não aciona automaticamente
              uma equipe de resgate.
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
            disabled={enviando}
            accessibilityRole="button"
            accessibilityState={{
              disabled: enviando,
              busy: enviando,
            }}
            style={({ pressed }) => [
              styles.button,
              (pressed || enviando) && styles.disabled,
            ]}
          >
            {enviando && (
              <ActivityIndicator color={colors.surface} />
            )}

            <Text style={styles.buttonText}>
              {enviando ? "Enviando..." : "Registrar situação"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onVoltar}
            disabled={enviando}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelButton,
              (pressed || enviando) && styles.disabled,
            ]}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

type OpcaoProps = {
  titulo: string;
  descricao?: string;
  selecionada: boolean;
  desabilitada: boolean;
  onPress: () => void;
};

function Opcao({
  titulo,
  descricao,
  selecionada,
  desabilitada,
  onPress,
}: OpcaoProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitada}
      accessibilityRole="radio"
      accessibilityState={{
        checked: selecionada,
        disabled: desabilitada,
      }}
      style={({ pressed }) => [
        styles.option,
        selecionada && styles.optionSelected,
        (pressed || desabilitada) && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.radio,
          selecionada && styles.radioSelected,
        ]}
      >
        {selecionada && <View style={styles.radioDot} />}
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{titulo}</Text>

        {descricao && (
          <Text style={styles.optionDescription}>
            {descricao}
          </Text>
        )}
      </View>
    </Pressable>
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
    gap: 20,
  },
  headerButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingRight: 12,
  },
  headerButtonText: {
    fontSize: 15,
    color: colors.primary,
  },
  section: {
    gap: 12,
  },
  title: {
    fontSize: 25,
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
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionContent: {
    flex: 1,
    gap: 5,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 16,
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  counter: {
    fontSize: 12,
    textAlign: "right",
    color: colors.textSecondary,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
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
    backgroundColor: "#FBEDEB",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#AD3028",
  },
  button: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.6,
  },
});