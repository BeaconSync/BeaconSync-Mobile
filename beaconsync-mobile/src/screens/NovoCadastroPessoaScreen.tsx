import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from "react";

import { Stack, useRouter } from "expo-router";

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

import SolicitarVinculoScreen from "./SolicitarVinculoScreen";

import {
  criarSolicitacaoVinculo,
} from "../services/solicitarVinculo";

import CampoFormulario from "../components/CampoFormulario";
import CamposCadastroJava from "../components/CamposCadastroJava";

import {
  useNovoCadastroPessoa,
} from "../hooks/useNovoCadastroPessoa";

import { useSessao } from "../hooks/useSessao";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

const titulos = [
  "Informações básicas",
  "Necessidades de apoio",
  "Endereço e autorização",
];

function mascaraData(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

export default function NovoCadastroPessoaScreen() {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const router = useRouter();

   const [
    solicitandoVinculo,
    setSolicitandoVinculo,
   ] = useState(false);

  const { autenticado } = useSessao();

  const formulario = useNovoCadastroPessoa();

  const {
    dados,
    etapa,
    erros,
    enviando,
    erroEnvio,
    resultado,
    alterar,
  } = formulario;

  const scroll =
    useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    scroll.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [etapa, erros, erroEnvio, resultado]);

  useEffect(() => {
    const listener = BackHandler.addEventListener(
      "hardwareBackPress",
      () => enviando
    );

    return () => listener.remove();
  }, [enviando]);

  function voltar() {
    if (enviando) return;

    Keyboard.dismiss();

    if (etapa > 1) {
      formulario.voltar();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/pessoas");
    }
  }

  function botao(
    texto: string,
    acao: () => void,
    secundario = false
  ) {
    return (
      <Pressable
        onPress={acao}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityState={{ disabled: enviando }}
        style={({ pressed }) => [
          styles.button,
          secundario && styles.secondary,
          (pressed || enviando) && styles.dimmed,
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
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Cadastrar pessoa",
          headerShown: true,
          headerBackVisible: !enviando,
          gestureEnabled: !enviando,
        }}
      />

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {!autenticado ? (
          <>
            <Text style={styles.title}>
              Entre na sua conta
            </Text>

            <Text style={styles.description}>
              O cadastro real precisa de uma conta
              autenticada de responsável.
            </Text>

            {botao(
              "Voltar para pessoas",
              () => router.replace("/pessoas")
            )}
          </>
        ) : resultado ? (
          <>
            <Text style={styles.title}>
              {resultado.status === "criado"
                ? "Cadastro concluído"
                : "Já existe um cadastro"}
            </Text>

            <Text style={styles.description}>
              {resultado.status === "criado"
                ? "A pessoa e o endereço foram cadastrados. Seu vínculo de responsável também foi criado."
                : "Já existe uma pessoa cadastrada com esse CPF. Nenhum novo cadastro foi criado. Confira o CPF ou verifique se a pessoa já aparece em Pessoas. Um vínculo novo depende de solicitação e aprovação."}
            </Text>

            {resultado.status === "criado" &&
              botao("Ver pessoa cadastrada", () => {
                router.replace({
                  pathname: "/pessoa/[id]",
                  params: {
                    id: resultado.pessoaId,
                  },
                });
              })}

            {resultado.status === "existente" && (
  <>
    {botao(
      "Solicitar vínculo",
      () => setSolicitandoVinculo(true)
    )}

    {botao(
      "Conferir CPF",
      formulario.revisar,
      true
    )}
  </>
)}

            {botao(
              "Voltar para pessoas",
              () => router.replace("/pessoas"),
              true
            )}
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Etapa {etapa} de 3
            </Text>

            <Text style={styles.title}>
              {titulos[etapa - 1]}
            </Text>

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

            {etapa === 1 && (
              <>
                <CampoFormulario
                  label="Nome completo"
                  value={dados.nome}
                  onChangeText={(valor) =>
                    alterar("nome", valor)
                  }
                  maxLength={120}
                  editable={!enviando}
                  erro={erros.nome}
                  autoCapitalize="words"
                />

                <CamposCadastroJava
                  etapa={1}
                  dados={dados}
                  erros={erros}
                  onAlterar={alterar}
                  desabilitado={enviando}
                />

                <CampoFormulario
                  label="Data de nascimento"
                  value={dados.dataNascimento}
                  onChangeText={(valor) =>
                    alterar(
                      "dataNascimento",
                      mascaraData(valor)
                    )
                  }
                  placeholder="DD/MM/AAAA"
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!enviando}
                  erro={erros.dataNascimento}
                />

                <CampoFormulario
                  label="Seu vínculo com a pessoa"
                  value={dados.vinculo}
                  onChangeText={(valor) =>
                    alterar("vinculo", valor)
                  }
                  placeholder="Ex.: filha, neto, amigo ou cuidador"
                  maxLength={40}
                  editable={!enviando}
                  erro={erros.vinculo}
                />
              </>
            )}

            {etapa === 2 && (
              <>
                <CamposCadastroJava
                  etapa={2}
                  dados={dados}
                  erros={erros}
                  onAlterar={alterar}
                  desabilitado={enviando}
                />

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
              </>
            )}

            {etapa === 3 && (
              <>
                <CampoFormulario
                  label="Nome do local"
                  value={dados.nomeLocal}
                  onChangeText={(valor) =>
                    alterar("nomeLocal", valor)
                  }
                  placeholder="Ex.: casa da família"
                  maxLength={60}
                  editable={!enviando}
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
                        .replace(/^(\d{5})(\d)/, "$1-$2")
                    )
                  }
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  maxLength={9}
                  editable={!enviando}
                  erro={erros.cep}
                />

                <CampoFormulario
                  label="Rua"
                  value={dados.rua}
                  onChangeText={(valor) =>
                    alterar("rua", valor)
                  }
                  maxLength={150}
                  editable={!enviando}
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
                  editable={!enviando}
                  erro={erros.numero}
                />

                <CampoFormulario
                  label="Complemento (opcional)"
                  value={dados.complemento}
                  onChangeText={(valor) =>
                    alterar("complemento", valor)
                  }
                  maxLength={60}
                  editable={!enviando}
                  erro={erros.complemento}
                />

                <CamposCadastroJava
                  etapa={3}
                  dados={dados}
                  erros={erros}
                  onAlterar={alterar}
                  desabilitado={enviando}
                />

                <Text style={styles.description}>
                  Este endereço ficará indicado como
                  atual no cadastro. Isso não confirma
                  a presença nem a segurança da pessoa.
                </Text>

                <Pressable
                  onPress={() =>
                    alterar(
                      "autorizado",
                      !dados.autorizado
                    )
                  }
                  disabled={enviando}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: dados.autorizado,
                    disabled: enviando,
                  }}
                  style={styles.consent}
                >
                  <Text style={styles.description}>
                    {dados.autorizado ? "☑ " : "☐ "}
                    Confirmo que tenho autorização da
                    pessoa ou de seu responsável legal
                    para cadastrar e compartilhar estes
                    dados para acompanhamento e apoio.
                  </Text>
                </Pressable>

                {erros.autorizado && (
                  <Text style={styles.error}>
                    {erros.autorizado}
                  </Text>
                )}
              </>
            )}

            {enviando && (
              <ActivityIndicator
                color={colors.primary}
                accessibilityLabel="Enviando cadastro"
              />
            )}

            {botao(
              enviando
                ? "Enviando..."
                : etapa === 3
                  ? "Concluir cadastro"
                  : "Continuar",
              () => {
                Keyboard.dismiss();
                void formulario.continuar();
              }
            )}

            {botao("Voltar", voltar, true)}
          </>
        )}
      </ScrollView>

        {autenticado &&
  solicitandoVinculo &&
  resultado?.status === "existente" && (
    <SolicitarVinculoScreen
      key={resultado.pessoaId}
      referenciaCadastro={resultado.pessoaId}

      onSolicitar={criarSolicitacaoVinculo(
        resultado.pessoaId
      )}

      onFechar={() =>
        setSolicitandoVinculo(false)
      }

      onConcluido={() => {
        setSolicitandoVinculo(false);
        router.replace("/pessoas");
      }}
    />
  )}

    </SafeAreaView>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
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
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.warningText,
    marginBottom: 16,
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.onPrimary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
  },
  consent: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
  },
  dimmed: {
    opacity: 0.6,
  },
}));