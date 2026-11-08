import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Info,
  ShieldCheck,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CampoFormulario from "../components/CampoFormulario";
import {
  formatarCep,
  formatarData,
  necessidades,
  recursos,
  ufs,
  usePessoaForm,
  vinculos,
} from "../hooks/usePessoaForm";
import { colors } from "../theme/colors";
import type { EnviarCadastroPessoa } from "../types/cadastroPessoa";

type Props = {
  onCadastrar?: EnviarCadastroPessoa;
};

type Painel = "uf" | "privacidade" | "resumo" | null;

type CampoTexto =
  | "nome"
  | "dataNascimento"
  | "outraNecessidade"
  | "observacoes"
  | "nomeLocal"
  | "cep"
  | "rua"
  | "numero"
  | "complemento"
  | "bairro"
  | "cidade"
  | "pontoReferencia";

const etapas = [
  {
    nome: "Identificação",
    titulo: "Informações básicas",
    descricao:
      "Vamos conhecer quem você acompanha. Campos obrigatórios, exceto quando indicado.",
  },
  {
    nome: "Apoio",
    titulo: "Necessidades de apoio",
    descricao:
      "Essas informações ajudam a planejar o cuidado e o deslocamento em uma enchente.",
  },
  {
    nome: "Endereço",
    titulo: "Endereço e autorização",
    descricao:
      "Informe um local de referência e diga se a pessoa está lá agora.",
  },
];

const opcoesPresenca = ["Sim", "Não", "Não sei informar"];

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (!partes.length) return "";

  return (
    partes[0][0] +
    (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
}

export default function CadastroPessoaScreen({
  onCadastrar,
}: Props) {
  const router = useRouter();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const selecionandoFoto = useRef(false);

  const [painel, setPainel] = useState<Painel>(null);
  const [concluido, setConcluido] = useState(false);
  const [escolhendoFoto, setEscolhendoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  const {
    dados,
    etapa,
    erros,
    enviando,
    erroEnvio,
    alterarCampo,
    alternarSelecao,
    avancar,
    voltar,
    enviar,
  } = usePessoaForm(onCadastrar);

  const bloqueado = enviando || escolhendoFoto;
  const etapaAtual = etapas[etapa - 1];

  const presenca =
    dados.localizacaoConfirmada === true
      ? "Sim"
      : dados.localizacaoConfirmada === false
        ? "Não"
        : "Não sei informar";

  const explicacaoPresenca =
    dados.localizacaoConfirmada === true
      ? "Presença informada por você. Isso não confirma que a pessoa está em segurança."
      : dados.localizacaoConfirmada === false
        ? "Você informou que a pessoa não está neste endereço. A localização atual continua desconhecida."
        : "A localização permanece sem confirmação até uma nova informação.";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [etapa, concluido]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => bloqueado
    );

    return () => subscription.remove();
  }, [bloqueado]);

  function irParaPessoas() {
    Keyboard.dismiss();
    router.replace("/pessoas");
  }

  function voltarEtapa() {
    if (bloqueado) return;

    Keyboard.dismiss();

    if (etapa > 1) {
      voltar();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      irParaPessoas();
    }
  }

  async function continuar() {
    if (bloqueado) return;

    Keyboard.dismiss();

    if (etapa < 3) {
      if (!avancar()) {
        scrollRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }

      return;
    }

    const sucesso = await enviar();

    if (sucesso) {
      setConcluido(true);
    } else {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }
  }

  async function escolherFoto() {
    if (bloqueado || selecionandoFoto.current) return;

    selecionandoFoto.current = true;
    setEscolhendoFoto(true);
    setErroFoto(null);
    Keyboard.dismiss();

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets[0]) {
        alterarCampo("fotoUri", resultado.assets[0].uri);
      }
    } catch {
      setErroFoto(
        "Não foi possível selecionar a foto. Tente novamente."
      );
    } finally {
      selecionandoFoto.current = false;
      setEscolhendoFoto(false);
    }
  }

  function abrirPainel(valor: Painel) {
    if (bloqueado) return;

    Keyboard.dismiss();
    setPainel(valor);
  }

  function campo(
    nome: CampoTexto,
    label: string,
    placeholder: string,
    maxLength = 150,
    multiline = false
  ) {
    return (
      <CampoFormulario
        label={label}
        value={dados[nome]}
        onChangeText={(valor) => {
          const texto =
            nome === "cep"
              ? formatarCep(valor)
              : nome === "dataNascimento"
                ? formatarData(valor)
                : valor;

          alterarCampo(nome, texto);
        }}
        erro={erros[nome]}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline={multiline}
        keyboardType={
          nome === "cep" || nome === "dataNascimento"
            ? "number-pad"
            : "default"
        }
        autoCapitalize={
          nome === "observacoes" || nome === "outraNecessidade"
            ? "sentences"
            : "words"
        }
        editable={!bloqueado}
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Cadastrar pessoa",
          headerBackButtonDisplayMode: "minimal",
          headerBackVisible: !bloqueado,
          gestureEnabled: !bloqueado,
        }}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {concluido ? (
          <View style={styles.success}>
            <View style={styles.successIcon}>
              <Check size={30} color="#31715A" />
            </View>

            <Text style={styles.successTitle}>
              Cadastro concluído
            </Text>

            <Text style={styles.centerDescription}>
              Agora você pode acompanhar essa pessoa e manter
              as informações de apoio atualizadas.
            </Text>

            <View style={styles.personCard}>
              <Avatar nome={dados.nome} uri={dados.fotoUri} />

              <View style={styles.flex}>
                <Text style={styles.personName}>
                  {dados.nome.trim()}
                </Text>
                <Text style={styles.helper}>
                  {dados.vinculo} · Cadastro salvo
                </Text>
              </View>

              <Check size={20} color="#31715A" />
            </View>

            <Aviso texto="O cadastro não confirma segurança nem aciona um resgate. Durante um alerta, mantenha a situação da pessoa atualizada." />

            <Botao
              texto="Ver dados cadastrados"
              onPress={() => abrirPainel("resumo")}
            />

            <Botao
              texto="Voltar para pessoas"
              secundario
              onPress={irParaPessoas}
            />
          </View>
        ) : (
          <>
            <View style={styles.stepHeader}>
              <Text style={styles.stepText}>
                Etapa {etapa} de 3
              </Text>
              <Text style={styles.helper}>
                {etapaAtual.nome}
              </Text>
            </View>

            <View
              style={styles.progress}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Progresso do cadastro"
              accessibilityValue={{ min: 1, max: 3, now: etapa }}
            >
              {[1, 2, 3].map((numero) => (
                <View
                  key={numero}
                  style={[
                    styles.progressPart,
                    numero <= etapa && styles.progressActive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.title}>
              {etapaAtual.titulo}
            </Text>

            <Text style={styles.description}>
              {etapaAtual.descricao}
            </Text>

            {Object.values(erros).some(Boolean) && (
              <Aviso
                erro
                texto="Confira os campos indicados antes de continuar."
              />
            )}

            {erroEnvio && <Aviso erro texto={erroEnvio} />}

            {etapa === 1 && (
              <>
                <Pressable
                  onPress={escolherFoto}
                  disabled={bloqueado}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar foto da pessoa"
                  style={styles.photoButton}
                >
                  <Avatar nome={dados.nome} uri={dados.fotoUri} />

                  <View style={styles.flex}>
                    <Text style={styles.linkText}>
                      {escolhendoFoto
                        ? "Abrindo galeria..."
                        : dados.fotoUri
                          ? "Alterar foto"
                          : "Adicionar foto"}
                    </Text>

                    <Text style={styles.helper}>
                      Opcional. Sem foto, usamos as iniciais do nome.
                    </Text>
                  </View>
                </Pressable>

                {dados.fotoUri && (
                  <Pressable
                    onPress={() => alterarCampo("fotoUri", null)}
                    disabled={bloqueado}
                    accessibilityRole="button"
                    style={styles.removePhoto}
                  >
                    <Text style={styles.linkText}>
                      Remover foto
                    </Text>
                  </Pressable>
                )}

                {erroFoto && <Aviso erro texto={erroFoto} />}

                {campo(
                  "nome",
                  "Nome completo",
                  "Digite o nome completo"
                )}

                {campo(
                  "dataNascimento",
                  "Data de nascimento",
                  "DD/MM/AAAA",
                  10
                )}

                <Escolhas
                  titulo="Qual é o seu vínculo com a pessoa?"
                  opcoes={vinculos}
                  selecionados={[dados.vinculo]}
                  onSelecionar={(valor) =>
                    alterarCampo("vinculo", valor)
                  }
                  erro={erros.vinculo}
                  desabilitado={bloqueado}
                  duasColunas
                />

                <Aviso texto="Cadastre apenas informações que você está autorizado a compartilhar." />
              </>
            )}

            {etapa === 2 && (
              <>
                <Escolhas
                  titulo="Selecione todas as opções necessárias."
                  opcoes={necessidades}
                  selecionados={dados.necessidades}
                  onSelecionar={(valor) =>
                    alternarSelecao("necessidades", valor)
                  }
                  erro={erros.necessidades}
                  desabilitado={bloqueado}
                  multiplo
                />

                {dados.necessidades.includes("Outra") &&
                  campo(
                    "outraNecessidade",
                    "Qual é a outra necessidade?",
                    "Descreva o apoio necessário",
                    300,
                    true
                  )}

                <Text style={styles.sectionTitle}>
                  Para o deslocamento
                </Text>

                <Text style={styles.description}>
                  Marque os recursos necessários. Você pode
                  escolher mais de um ou deixar sem seleção.
                </Text>

                <Escolhas
                  opcoes={recursos}
                  selecionados={dados.recursos}
                  onSelecionar={(valor) =>
                    alternarSelecao("recursos", valor)
                  }
                  desabilitado={bloqueado}
                  multiplo
                />

                {campo(
                  "observacoes",
                  "Observações (opcional)",
                  "Ex.: precisa de ajuda para sair de casa ou de apoio nas transferências.",
                  500,
                  true
                )}
              </>
            )}

            {etapa === 3 && (
              <>
                {campo(
                  "nomeLocal",
                  "Nome do local",
                  "Ex.: casa de um familiar",
                  80
                )}

                {campo("cep", "CEP", "00000-000", 9)}

                {campo("rua", "Rua", "Nome da rua")}

                <View style={styles.fieldRow}>
                  <View style={styles.smallField}>
                    {campo("numero", "Número", "85 ou S/N", 20)}
                  </View>

                  <View style={styles.largeField}>
                    {campo(
                      "complemento",
                      "Complemento (opcional)",
                      "Apto., bloco...",
                      100
                    )}
                  </View>
                </View>

                {campo("bairro", "Bairro", "Nome do bairro", 100)}

                <View style={styles.fieldRow}>
                  <View style={styles.largeField}>
                    {campo(
                      "cidade",
                      "Cidade",
                      "Nome da cidade",
                      100
                    )}
                  </View>

                  <View style={styles.ufField}>
                    <Text style={styles.label}>Estado</Text>

                    <Pressable
                      onPress={() => abrirPainel("uf")}
                      disabled={bloqueado}
                      accessibilityRole="button"
                      accessibilityLabel={
                        dados.uf
                          ? `Estado selecionado: ${dados.uf}. Alterar`
                          : "Selecionar estado"
                      }
                      style={[
                        styles.select,
                        Boolean(erros.uf) && styles.invalid,
                      ]}
                    >
                      <Text style={styles.optionText}>
                        {dados.uf || "UF"}
                      </Text>
                      <ChevronRight
                        size={18}
                        color={colors.textSecondary}
                      />
                    </Pressable>

                    {erros.uf && (
                      <Text style={styles.error}>
                        {erros.uf}
                      </Text>
                    )}
                  </View>
                </View>

                {campo(
                  "pontoReferencia",
                  "Ponto de referência (opcional)",
                  "Ex.: próximo à praça",
                  200
                )}

                <Escolhas
                  titulo="Essa pessoa está neste endereço agora?"
                  opcoes={opcoesPresenca}
                  selecionados={[presenca]}
                  onSelecionar={(valor) =>
                    alterarCampo(
                      "localizacaoConfirmada",
                      valor === "Sim"
                        ? true
                        : valor === "Não"
                          ? false
                          : null
                    )
                  }
                  desabilitado={bloqueado}
                  duasColunas
                />

                <Text style={styles.presenceHelp}>
                  {explicacaoPresenca}
                </Text>

                <Escolhas
                  opcoes={[
                    "Confirmo que tenho autorização para cadastrar e compartilhar estes dados para acompanhamento e apoio.",
                  ]}
                  selecionados={
                    dados.autorizado
                      ? [
                          "Confirmo que tenho autorização para cadastrar e compartilhar estes dados para acompanhamento e apoio.",
                        ]
                      : []
                  }
                  onSelecionar={() =>
                    alterarCampo("autorizado", !dados.autorizado)
                  }
                  erro={erros.autorizado}
                  desabilitado={bloqueado}
                  multiplo
                />

                <Pressable
                  onPress={() => abrirPainel("privacidade")}
                  disabled={bloqueado}
                  accessibilityRole="button"
                  style={styles.privacyLink}
                >
                  <ShieldCheck size={20} color={colors.primary} />
                  <Text style={[styles.linkText, styles.flex]}>
                    Sobre o uso dos dados
                  </Text>
                  <ChevronRight size={18} color={colors.primary} />
                </Pressable>
              </>
            )}

            {enviando && (
              <Aviso texto="Enviando seu cadastro. Aguarde a confirmação; não é necessário enviar novamente." />
            )}

            <View style={styles.actions}>
              <View style={styles.backAction}>
                <Botao
                  texto="Voltar"
                  secundario
                  desabilitado={bloqueado}
                  onPress={voltarEtapa}
                />
              </View>

              <View style={styles.flex}>
                <Botao
                  texto={
                    enviando
                      ? "Enviando..."
                      : etapa === 3
                        ? "Concluir cadastro"
                        : "Continuar"
                  }
                  carregando={enviando}
                  desabilitado={bloqueado}
                  seta={etapa < 3}
                  onPress={continuar}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={painel !== null}
        animationType="slide"
        onRequestClose={() => setPainel(null)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.sectionTitle}>
              {painel === "uf"
                ? "Selecionar estado"
                : painel === "privacidade"
                  ? "Sobre os dados"
                  : "Dados cadastrados"}
            </Text>

            <Pressable
              onPress={() => setPainel(null)}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {painel === "uf" && (
              <Escolhas
                opcoes={ufs}
                selecionados={[dados.uf]}
                onSelecionar={(valor) => {
                  alterarCampo("uf", valor);
                  setPainel(null);
                }}
                duasColunas
              />
            )}

            {painel === "privacidade" && (
              <>
                <Text style={styles.title}>
                  Cuidado também com as informações
                </Text>

                <Text style={styles.description}>
                  Entenda a finalidade dos dados antes de
                  autorizar o cadastro.
                </Text>

                <View style={styles.infoCard}>
                  <Detalhe
                    titulo="Para acompanhar e apoiar"
                    valor="Nome, endereço e necessidades de apoio ajudam a organizar o acompanhamento e o deslocamento durante enchentes."
                  />
                  <Detalhe
                    titulo="Cadastre apenas o necessário"
                    valor="Evite incluir documentos, senhas ou informações sem relação com o acompanhamento."
                  />
                  <Detalhe
                    titulo="Mantenha as informações atualizadas"
                    valor="Um endereço de referência não confirma a localização atual nem a segurança da pessoa."
                  />
                  <Detalhe
                    titulo="Autorização"
                    valor="Confirme que você tem autorização da pessoa ou de seu responsável para informar esses dados."
                  />
                </View>

                <Text style={styles.description}>
                  Abrir esta explicação não marca a autorização
                  do formulário.
                </Text>

                <Botao
                  texto="Voltar ao formulário"
                  secundario
                  onPress={() => setPainel(null)}
                />
              </>
            )}

            {painel === "resumo" && (
              <>
                <View style={styles.personCard}>
                  <Avatar nome={dados.nome} uri={dados.fotoUri} />
                  <View style={styles.flex}>
                    <Text style={styles.personName}>
                      {dados.nome.trim()}
                    </Text>
                    <Text style={styles.helper}>
                      {dados.vinculo}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <Detalhe
                    titulo="Data de nascimento"
                    valor={dados.dataNascimento}
                  />
                  <Detalhe
                    titulo="Necessidades de apoio"
                    valor={dados.necessidades
                      .map((item) =>
                        item === "Outra"
                          ? dados.outraNecessidade
                          : item
                      )
                      .join(", ")}
                  />
                  <Detalhe
                    titulo="Recursos para deslocamento"
                    valor={dados.recursos.join(", ")}
                  />
                  <Detalhe
                    titulo="Observações"
                    valor={dados.observacoes}
                  />
                  <Detalhe
                    titulo={dados.nomeLocal}
                    valor={[
                      `${dados.rua}, ${dados.numero}`,
                      dados.complemento,
                      dados.bairro,
                      `${dados.cidade} - ${dados.uf}`,
                      `CEP ${dados.cep}`,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  />
                  <Detalhe
                    titulo="Ponto de referência"
                    valor={dados.pontoReferencia}
                  />
                  <Detalhe
                    titulo="Presença informada no cadastro"
                    valor={presenca}
                  />
                </View>

                <Aviso texto="Este resumo mostra os dados enviados no cadastro. A situação da pessoa pode mudar." />

                <Botao
                  texto="Voltar"
                  secundario
                  onPress={() => setPainel(null)}
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Avatar({
  nome,
  uri,
}: {
  nome: string;
  uri?: string | null;
}) {
  const iniciais = obterIniciais(nome);

  return (
    <View style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : iniciais ? (
        <Text style={styles.initials}>{iniciais}</Text>
      ) : (
        <Camera size={23} color={colors.primary} />
      )}
    </View>
  );
}

function Aviso({
  texto,
  erro = false,
}: {
  texto: string;
  erro?: boolean;
}) {
  return (
    <View style={[styles.notice, erro && styles.errorNotice]}>
      <Info
        size={18}
        color={erro ? colors.warningText : colors.primary}
      />
      <Text
        accessibilityLiveRegion="polite"
        style={[
          styles.noticeText,
          erro && { color: colors.warningText },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

function Detalhe({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{titulo}</Text>
      <Text style={styles.detailText}>
        {valor.trim() || "Não informado"}
      </Text>
    </View>
  );
}

type EscolhasProps = {
  titulo?: string;
  opcoes: string[];
  selecionados: string[];
  onSelecionar: (valor: string) => void;
  erro?: string;
  multiplo?: boolean;
  duasColunas?: boolean;
  desabilitado?: boolean;
};

function Escolhas({
  titulo,
  opcoes,
  selecionados,
  onSelecionar,
  erro,
  multiplo = false,
  duasColunas = false,
  desabilitado = false,
}: EscolhasProps) {
  return (
    <View style={styles.group}>
      {titulo && <Text style={styles.label}>{titulo}</Text>}

      <View style={duasColunas ? styles.grid : styles.list}>
        {opcoes.map((opcao) => {
          const selecionado = selecionados.includes(opcao);

          return (
            <Pressable
              key={opcao}
              onPress={() => onSelecionar(opcao)}
              disabled={desabilitado}
              accessibilityRole={multiplo ? "checkbox" : "radio"}
              accessibilityState={{
                checked: selecionado,
                disabled: desabilitado,
              }}
              style={({ pressed }) => [
                styles.option,
                duasColunas && styles.gridOption,
                selecionado && styles.optionSelected,
                (pressed || desabilitado) && styles.dimmed,
              ]}
            >
              <View
                style={[
                  styles.indicator,
                  !multiplo && styles.radio,
                  selecionado && styles.indicatorSelected,
                ]}
              >
                {selecionado &&
                  (multiplo ? (
                    <Check size={14} color={colors.surface} />
                  ) : (
                    <View style={styles.radioDot} />
                  ))}
              </View>

              <Text style={styles.optionText}>
                {opcao === "Outra" ? "Outra necessidade" : opcao}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {erro && <Text style={styles.error}>{erro}</Text>}
    </View>
  );
}

type BotaoProps = {
  texto: string;
  onPress: () => void;
  secundario?: boolean;
  desabilitado?: boolean;
  carregando?: boolean;
  seta?: boolean;
};

function Botao({
  texto,
  onPress,
  secundario = false,
  desabilitado = false,
  carregando = false,
  seta = false,
}: BotaoProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{
        disabled: desabilitado,
        busy: carregando,
      }}
      style={({ pressed }) => [
        styles.button,
        secundario ? styles.secondaryButton : styles.primaryButton,
        (pressed || desabilitado) && styles.dimmed,
      ]}
    >
      {carregando ? (
        <ActivityIndicator
          color={secundario ? colors.primary : colors.surface}
        />
      ) : seta ? (
        <ArrowRight size={18} color={colors.surface} />
      ) : null}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  flex: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  progress: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
  },
  progressPart: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#62655E",
    marginBottom: 22,
  },
  helper: {
    fontSize: 13,
    lineHeight: 19,
    color: "#62655E",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    flexShrink: 1,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    minHeight: 64,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  initials: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  linkText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.primary,
  },
  removePhoto: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    marginBottom: 12,
  },
  group: {
    gap: 10,
    marginBottom: 22,
  },
  list: {
    gap: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  gridOption: {
    flexBasis: "46%",
    flexGrow: 1,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  indicator: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  radio: {
    borderRadius: 10,
  },
  indicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  optionText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#76581F",
  },
  errorNotice: {
    backgroundColor: colors.warningBackground,
  },
  error: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.warningText,
    marginTop: 6,
  },
  invalid: {
    borderColor: colors.warningText,
  },
  fieldRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  smallField: {
    flexGrow: 1,
    flexBasis: 100,
  },
  largeField: {
    flexGrow: 2,
    flexBasis: 170,
  },
  ufField: {
    flexGrow: 1,
    flexBasis: 85,
    gap: 8,
    marginBottom: 22,
  },
  select: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presenceHelp: {
    fontSize: 13,
    lineHeight: 20,
    color: "#62655E",
    marginTop: -10,
    marginBottom: 24,
  },
  privacyLink: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    marginTop: 12,
  },
  backAction: {
    flex: 0.5,
  },
  button: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  secondaryText: {
    color: colors.text,
  },
  dimmed: {
    opacity: 0.6,
  },
  success: {
    paddingTop: 44,
    gap: 12,
  },
  successIcon: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3ED",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  centerDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: "#62655E",
    marginBottom: 14,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 14,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  infoCard: {
    padding: 18,
    gap: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 22,
  },
  detail: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#62655E",
  },
});