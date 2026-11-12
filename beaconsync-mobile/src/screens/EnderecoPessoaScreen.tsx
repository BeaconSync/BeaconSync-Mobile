import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEnderecoPessoaForm } from "../hooks/useEnderecoPessoaForm";
import { colors } from "../theme/colors";
import type {
  EnderecoDetalhesPessoa,
  PessoaDetalhes,
} from "../types/detalhaPessoa";
import type {
  FormularioEnderecoPessoa,
  SalvarEnderecoPessoa,
} from "../types/enderecoPessoa";
import { formatarCepEndereco } from "../utils/enderecoPessoa";

type Props = {
  pessoa: PessoaDetalhes;
  demonstracao?: boolean;
  onFechar: () => void;
  onAtualizados: (enderecos: EnderecoDetalhesPessoa[]) => void;
  onSalvar?: SalvarEnderecoPessoa;
};

type CampoTexto = Exclude<keyof FormularioEnderecoPessoa, "indicadoComoAtual">;

const campos: {
  campo: CampoTexto;
  rotulo: string;
  placeholder: string;
  maxLength: number;
  teclado?: TextInputProps["keyboardType"];
  multiline?: boolean;
}[] = [
  {
    campo: "nomeLocal",
    rotulo: "Nome do local",
    placeholder: "Ex.: casa da filha",
    maxLength: 100,
  },
  {
    campo: "cep",
    rotulo: "CEP",
    placeholder: "00000-000",
    maxLength: 9,
    teclado: "number-pad",
  },
  {
    campo: "logradouro",
    rotulo: "Rua / logradouro",
    placeholder: "Nome da rua",
    maxLength: 160,
  },
  {
    campo: "numero",
    rotulo: "Número",
    placeholder: "Ex.: 100 ou S/N",
    maxLength: 20,
  },
  {
    campo: "complemento",
    rotulo: "Complemento (opcional)",
    placeholder: "Apartamento, bloco...",
    maxLength: 100,
  },
  {
    campo: "bairro",
    rotulo: "Bairro",
    placeholder: "Nome do bairro",
    maxLength: 100,
  },
  {
    campo: "distrito",
    rotulo: "Distrito (opcional)",
    placeholder: "Nome do distrito",
    maxLength: 100,
  },
  {
    campo: "cidade",
    rotulo: "Cidade",
    placeholder: "Nome da cidade",
    maxLength: 100,
  },
  { campo: "uf", rotulo: "Estado (UF)", placeholder: "SP", maxLength: 2 },
  {
    campo: "tipoImovel",
    rotulo: "Tipo de imóvel (opcional)",
    placeholder: "Casa, sobrado, apartamento...",
    maxLength: 60,
  },
  {
    campo: "andar",
    rotulo: "Andar (opcional)",
    placeholder: "Ex.: 0 para térreo, 2 ou -1",
    maxLength: 6,
    teclado: "numbers-and-punctuation",
  },
  {
    campo: "pontoReferencia",
    rotulo: "Ponto de referência (opcional)",
    placeholder: "Uma referência que ajude a localizar o endereço",
    maxLength: 300,
    multiline: true,
  },
];

export default function EnderecosPessoaScreen({
  pessoa,
  demonstracao = false,
  onFechar,
  onAtualizados,
  onSalvar,
}: Props) {
  const formulario = useEnderecoPessoaForm(pessoa.id, onSalvar);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const titulo = formulario.aberto
    ? formulario.enderecoId
      ? "Editar endereço"
      : "Adicionar endereço"
    : "Endereços cadastrados";

  function voltar() {
    if (formulario.estaEnviando()) return;
    Keyboard.dismiss();
    if (!formulario.aberto) {
      onFechar();
      return;
    }
    if (formulario.temAlteracoes) {
      Alert.alert(
        "Descartar alterações?",
        "Os campos que você alterou ainda não foram salvos.",
        [
          { text: "Continuar editando", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: formulario.fechar,
          },
        ],
      );
      return;
    }
    formulario.fechar();
  }

  function abrir(endereco?: EnderecoDetalhesPessoa) {
    setMensagem(null);
    formulario.abrir(endereco);
  }

  async function confirmar() {
    Keyboard.dismiss();
    const atualizados = await formulario.salvar();
    if (!atualizados) return;
    onAtualizados(atualizados);
    formulario.fechar();
    setMensagem("Endereços atualizados com a confirmação do servidor.");
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={voltar}
    >
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={styles.container}
          edges={["top", "bottom", "left", "right"]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{titulo}</Text>
            <Pressable
              onPress={voltar}
              disabled={formulario.enviando}
              accessibilityRole="button"
              accessibilityState={{ disabled: formulario.enviando }}
              style={({ pressed }) => [
                styles.headerButton,
                (pressed || formulario.enviando) && styles.dimmed,
              ]}
            >
              <Text style={styles.linkText}>
                {formulario.aberto ? "Cancelar" : "Fechar"}
              </Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : undefined}
          >
            <ScrollView
              key={
                formulario.aberto
                  ? `form-${formulario.enderecoId ?? "novo"}`
                  : "lista"
              }
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
                    Prévia de desenvolvimento: os endereços exibidos são
                    fictícios. A gravação ainda não está disponível.
                  </Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.title}>{pessoa.nome}</Text>
                <Text style={styles.description}>
                  {formulario.aberto
                    ? "Preencha os dados do endereço. Campos obrigatórios, exceto quando indicado."
                    : "Mantenha os endereços de referência organizados e atualizados."}
                </Text>
              </View>

              {formulario.aberto ? (
                <>
                  {campos.map(
                    ({
                      campo,
                      rotulo,
                      placeholder,
                      maxLength,
                      teclado,
                      multiline,
                    }) => (
                      <View key={campo} style={styles.section}>
                        <Text style={styles.label}>{rotulo}</Text>
                        <TextInput
                          value={formulario.dados[campo]}
                          onChangeText={(valor) =>
                            formulario.alterarCampo(
                              campo,
                              campo === "cep"
                                ? formatarCepEndereco(valor)
                                : campo === "uf"
                                  ? valor.toUpperCase()
                                  : valor,
                            )
                          }
                          editable={!formulario.enviando}
                          placeholder={placeholder}
                          placeholderTextColor={colors.textSecondary}
                          keyboardType={teclado ?? "default"}
                          autoCapitalize={
                            campo === "uf" ? "characters" : "sentences"
                          }
                          autoCorrect={false}
                          maxLength={maxLength}
                          multiline={multiline}
                          accessibilityLabel={rotulo}
                          style={[
                            styles.input,
                            multiline && styles.multiline,
                            !!formulario.erros[campo] && styles.invalidInput,
                          ]}
                        />
                        {formulario.erros[campo] && (
                          <Text
                            style={styles.errorText}
                            accessibilityLiveRegion="polite"
                          >
                            {formulario.erros[campo]}
                          </Text>
                        )}
                      </View>
                    ),
                  )}

                  <View style={styles.card}>
                    <View style={styles.switchRow}>
                      <Text style={[styles.label, styles.flex]}>
                        Indicar como atual no cadastro
                      </Text>
                      <Switch
                        value={formulario.dados.indicadoComoAtual}
                        onValueChange={(valor) =>
                          formulario.alterarCampo("indicadoComoAtual", valor)
                        }
                        disabled={formulario.enviando}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        accessibilityLabel="Indicar este endereço como atual no cadastro"
                      />
                    </View>
                    <Text style={styles.helper}>
                      Ao salvar com esta opção marcada, este deve ser o único
                      endereço indicado como atual. Isso não confirma que a
                      pessoa está aqui. A presença é registrada separadamente em
                      “Informar situação”.
                    </Text>
                  </View>

                  {Object.keys(formulario.erros).some(
                    (campo) =>
                      formulario.erros[campo as keyof typeof formulario.erros],
                  ) && (
                    <View style={styles.errorBox} accessibilityRole="alert">
                      <Text style={styles.errorText}>
                        Confira os campos indicados acima antes de salvar.
                      </Text>
                    </View>
                  )}

                  {formulario.erroEnvio && (
                    <View
                      style={styles.errorBox}
                      accessibilityRole="alert"
                      accessibilityLiveRegion="polite"
                    >
                      <Text style={styles.errorText}>
                        {formulario.erroEnvio}
                      </Text>
                    </View>
                  )}

                  <Botao
                    texto={
                      formulario.enviando ? "Salvando..." : "Salvar endereço"
                    }
                    onPress={confirmar}
                    desabilitado={formulario.enviando}
                    carregando={formulario.enviando}
                  />
                  <Botao
                    texto="Cancelar"
                    onPress={voltar}
                    secundario
                    desabilitado={formulario.enviando}
                  />
                </>
              ) : (
                <>
                  {mensagem && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>{mensagem}</Text>
                    </View>
                  )}
                  <Botao texto="+ Adicionar endereço" onPress={() => abrir()} />

                  {pessoa.enderecos.length === 0 ? (
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>
                        Nenhum endereço cadastrado
                      </Text>
                      <Text style={styles.description}>
                        Adicione um endereço de referência para esta pessoa.
                      </Text>
                    </View>
                  ) : (
                    pessoa.enderecos.map((endereco, indice) => (
                      <View key={endereco.id} style={styles.card}>
                        <Text style={styles.cardTitle}>
                          {endereco.nomeLocal?.trim() ||
                            `Endereço ${indice + 1}`}
                        </Text>
                        {endereco.indicadoComoAtual && (
                          <Text style={styles.currentTag}>
                            Indicado como atual no cadastro
                          </Text>
                        )}
                        <Text style={styles.body}>
                          {[
                            [endereco.logradouro, endereco.numero]
                              .filter(Boolean)
                              .join(", "),
                            endereco.complemento,
                            endereco.bairro,
                            endereco.distrito
                              ? `Distrito: ${endereco.distrito}`
                              : null,
                            [endereco.cidade, endereco.uf]
                              .filter(Boolean)
                              .join(" - "),
                            endereco.cep
                              ? `CEP: ${formatarCepEndereco(endereco.cep)}`
                              : null,
                            endereco.tipoImovel
                              ? `Tipo de imóvel: ${endereco.tipoImovel}`
                              : null,
                            endereco.andar != null
                              ? `Andar: ${endereco.andar}`
                              : null,
                            endereco.pontoReferencia
                              ? `Referência: ${endereco.pontoReferencia}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join("\n")}
                        </Text>

                        <View style={styles.presenceBox}>
                          <Text style={styles.helper}>
                            {endereco.presencaInformada === true
                              ? "Há um registro de presença neste endereço. Ele não confirma a presença neste momento."
                              : endereco.presencaInformada === false
                                ? "Foi informado que a pessoa não estava neste endereço."
                                : "Presença neste endereço não informada."}
                          </Text>
                          {endereco.presencaInformadaEm && (
                            <Text style={styles.helper}>
                              Informado em:{" "}
                              {formatarMomento(endereco.presencaInformadaEm)}
                            </Text>
                          )}
                        </View>
                        <Botao
                          texto="Editar endereço"
                          onPress={() => abrir(endereco)}
                          secundario
                        />
                      </View>
                    ))
                  )}

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Para indicar outro endereço como atual, abra “Editar
                      endereço” e marque a opção no formulário. O endereço e a
                      presença informada não confirmam segurança.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function formatarMomento(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? "Data não disponível"
    : data.toLocaleString("pt-BR");
}

function Botao({
  texto,
  onPress,
  secundario = false,
  desabilitado = false,
  carregando = false,
}: {
  texto: string;
  onPress: () => void;
  secundario?: boolean;
  desabilitado?: boolean;
  carregando?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado, busy: carregando }}
      style={({ pressed }) => [
        styles.button,
        secundario && styles.secondaryButton,
        (pressed || desabilitado) && styles.dimmed,
      ]}
    >
      {carregando && (
        <ActivityIndicator
          color={secundario ? colors.primary : colors.surface}
        />
      )}
      <Text style={[styles.buttonText, secundario && styles.linkText]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { flex: 1, fontSize: 19, fontWeight: "600", color: colors.text },
  headerButton: {
    minHeight: 48,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  section: { gap: 8 },
  title: { fontSize: 26, fontWeight: "600", color: colors.text },
  description: { fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  label: { fontSize: 15, fontWeight: "500", color: colors.text },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  invalidInput: { borderColor: "#AD3028" },
  card: {
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  body: { fontSize: 15, lineHeight: 24, color: colors.text },
  helper: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  currentTag: { fontSize: 13, fontWeight: "600", color: colors.primary },
  presenceBox: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  infoBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  infoText: { fontSize: 13, lineHeight: 20, color: colors.infoText },
  errorBox: { padding: 16, borderRadius: 14, backgroundColor: "#FBEDEB" },
  errorText: { fontSize: 13, lineHeight: 20, color: "#AD3028" },
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
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.surface,
  },
  linkText: { fontSize: 15, color: colors.primary },
  dimmed: { opacity: 0.6 },
});
