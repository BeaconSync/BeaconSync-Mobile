import {
  useRef,
  useState,
  type ComponentRef,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import CampoFormulario from "./CampoFormulario";
import CamposCadastroJava from "./CamposCadastroJava";

import {
  useEnderecosPessoa,
} from "../hooks/useEnderecosPessoa";

import {
  validarNovoEndereco,
} from "../services/enderecosPessoa";

import { colors } from "../theme/colors";

import type {
  EnderecoApi,
  NovoEndereco,
  ErrosNovoEndereco,
} from "../types/enderecosApi";

type Props = {
  pessoaId: string;
  nomePessoa: string;
  onFechar: () => void;
};

const iniciais: NovoEndereco = {
  nomeLocal: "",
  rua: "",
  numero: "",
  complemento: "",
  cep: "",
  distritoId: null,
};

export default function EnderecosPessoaConectados({
  pessoaId,
  nomePessoa,
  onFechar,
}: Props) {
  const consulta = useEnderecosPessoa(pessoaId);

  const {
    enderecos,
    pronto,
    ocupado,
    erro,
    aviso,
  } = consulta;

  const [aberto, setAberto] = useState(false);

  const [dados, setDados] =
    useState<NovoEndereco>(iniciais);

  const [erros, setErros] =
    useState<ErrosNovoEndereco>({});

  const scroll =
    useRef<ComponentRef<typeof ScrollView>>(null);

  function alterar<K extends keyof NovoEndereco>(
    campo: K,
    valor: NovoEndereco[K]
  ) {
    if (ocupado) return;

    setDados((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErros((atual) => ({
      ...atual,
      [campo]: undefined,
    }));
  }

  function fechar() {
    if (ocupado) return;

    Keyboard.dismiss();

    if (aberto) {
      setAberto(false);
    } else {
      onFechar();
    }
  }

  async function salvar() {
    if (ocupado) return;

    Keyboard.dismiss();

    const encontrados =
      validarNovoEndereco(dados);

    setErros(encontrados);

    if (Object.keys(encontrados).length > 0) {
      scroll.current?.scrollTo({
        y: 0,
        animated: true,
      });
      return;
    }

    if (await consulta.adicionar(dados)) {
      setAberto(false);
      setDados(iniciais);
    }

    scroll.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }

  function confirmarAtual(endereco: EnderecoApi) {
    Alert.alert(
      "Alterar endereço atual?",
      `Usar ${endereco.apelido} como endereço atual de ${nomePessoa}? Essa mudança atualiza a referência usada nos alertas e no mapa.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => {
            void consulta.definirAtual(endereco.id);
          },
        },
      ]
    );
  }

  function confirmarRemocao(
    endereco: EnderecoApi
  ) {
    Alert.alert(
      "Remover endereço?",
      `Remover ${endereco.apelido} deste cadastro?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            void consulta.remover(endereco.id);
          },
        },
      ]
    );
  }

  function botao(
    texto: string,
    acao: () => void,
    secundario = false
  ) {
    return (
      <Pressable
        onPress={acao}
        disabled={ocupado}
        accessibilityRole="button"
        accessibilityState={{
          disabled: ocupado,
        }}
        style={({ pressed }) => [
          styles.button,
          secundario && styles.secondary,
          (pressed || ocupado) && styles.dimmed,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            secundario && styles.secondaryText,
          ]}
        >
          {texto}
        </Text>
      </Pressable>
    );
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
            <Text style={styles.title}>
              {aberto
                ? "Adicionar endereço"
                : "Endereços"}
            </Text>

            <Pressable
              onPress={fechar}
              disabled={ocupado}
              accessibilityRole="button"
              style={styles.close}
            >
              <Text style={styles.link}>
                {aberto ? "Voltar" : "Fechar"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            <Text style={styles.name}>
              {nomePessoa}
            </Text>

            {erro && (
              <Text
                style={styles.error}
                accessibilityRole="alert"
              >
                {erro}
              </Text>
            )}

            {aviso && (
              <Text
                style={styles.notice}
                accessibilityLiveRegion="polite"
              >
                {aviso}
              </Text>
            )}

            {ocupado && (
              <ActivityIndicator
                color={colors.primary}
              />
            )}

            {botao(
              "Atualizar lista",
              () => {
                void consulta.carregar();
              },
              true
            )}

            {pronto && (
              aberto ? (
                <View style={styles.form}>
                  <CampoFormulario
                    label="Nome do local"
                    value={dados.nomeLocal}
                    onChangeText={(valor) =>
                      alterar("nomeLocal", valor)
                    }
                    maxLength={60}
                    editable={!ocupado}
                    erro={erros.nomeLocal}
                  />

                  <CampoFormulario
                    label="CEP"
                    value={dados.cep}
                    onChangeText={(valor) =>
                      alterar(
                        "cep",
                        valor
                          .replace(/\D/g, "")
                          .slice(0, 8)
                          .replace(
                            /^(\d{5})(\d)/,
                            "$1-$2"
                          )
                      )
                    }
                    keyboardType="number-pad"
                    maxLength={9}
                    editable={!ocupado}
                    erro={erros.cep}
                  />

                  <CampoFormulario
                    label="Rua"
                    value={dados.rua}
                    onChangeText={(valor) =>
                      alterar("rua", valor)
                    }
                    maxLength={150}
                    editable={!ocupado}
                    erro={erros.rua}
                  />

                  <CampoFormulario
                    label="Número"
                    value={dados.numero}
                    onChangeText={(valor) =>
                      alterar("numero", valor)
                    }
                    placeholder="Número ou S/N"
                    maxLength={10}
                    editable={!ocupado}
                    erro={erros.numero}
                  />

                  <CampoFormulario
                    label="Complemento (opcional)"
                    value={dados.complemento}
                    onChangeText={(valor) =>
                      alterar("complemento", valor)
                    }
                    maxLength={60}
                    editable={!ocupado}
                    erro={erros.complemento}
                  />

                  <CamposCadastroJava
                    etapa={3}
                    dados={{
                      distritoId: dados.distritoId,
                    }}
                    erros={erros}
                    desabilitado={ocupado}
                    onAlterar={(campo, valor) => {
                      if (
                        campo === "distritoId" &&
                        (
                          typeof valor === "number" ||
                          valor === null
                        )
                      ) {
                        alterar("distritoId", valor);
                      }
                    }}
                  />

                  <Text style={styles.description}>
                    Adicionar este endereço não altera
                    o endereço atual. Você poderá
                    escolhê-lo na lista depois de salvar.
                  </Text>

                  {botao(
                    "Salvar endereço",
                    () => {
                      void salvar();
                    }
                  )}

                  {botao(
                    "Voltar à lista",
                    fechar,
                    true
                  )}
                </View>
              ) : (
                <>
                  <Text style={styles.description}>
                    Para corrigir um endereço, adicione
                    o endereço correto. Se necessário,
                    indique-o como atual e remova o
                    anterior.
                  </Text>

                  {botao(
                    "Adicionar endereço",
                    () => setAberto(true)
                  )}

                  {enderecos.length === 0 && (
                    <Text style={styles.description}>
                      Nenhum endereço cadastrado.
                    </Text>
                  )}

                  {enderecos.map((endereco) => (
                    <View
                      key={endereco.id}
                      style={styles.card}
                    >
                      <Text style={styles.name}>
                        {endereco.apelido}
                      </Text>

                      {endereco.atual && (
                        <Text style={styles.link}>
                          Indicado como atual no cadastro
                        </Text>
                      )}

                      <Text style={styles.description}>
                        {endereco.logradouro},{" "}
                        {endereco.numero}

                        {endereco.complemento
                          ? `\n${endereco.complemento}`
                          : ""}

                        {"\n"}
                        Distrito: {endereco.distritoNome}
                        {"\n"}
                        CEP: {endereco.cep}
                      </Text>

                      {!endereco.atual && (
                        <>
                          {botao(
                            "Definir como atual",
                            () => confirmarAtual(endereco)
                          )}

                          {botao(
                            "Remover endereço",
                            () =>
                              confirmarRemocao(endereco),
                            true
                          )}
                        </>
                      )}
                    </View>
                  ))}

                  <Text style={styles.description}>
                    O endereço indicado como atual
                    não confirma que a pessoa esteja
                    em segurança.
                  </Text>
                </>
              )
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
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
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  close: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.warningText,
  },
  notice: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  link: {
    fontSize: 14,
    color: colors.primary,
  },
  form: {
    marginTop: 8,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  button: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
    textAlign: "center",
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.primary,
  },
  dimmed: {
    opacity: 0.6,
  },
});