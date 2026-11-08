import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Link2, ShieldCheck } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CampoFormulario from "./CampoFormulario";
import {
  useAcessoForm,
  type AcoesAcesso,
} from "../hooks/useAcessoForm";
import { colors } from "../theme/colors";

type TelaAcessoProps = AcoesAcesso & {
  modo: "login" | "cadastro";
};

export default function TelaAcesso({
  modo,
  onLogin,
  onCadastro,
}: TelaAcessoProps) {
  const router = useRouter();
  const cadastro = modo === "cadastro";

  const {
    dados,
    erros,
    mensagem,
    enviando,
    alterarCampo,
    enviar,
  } = useAcessoForm({
    modo,
    onLogin,
    onCadastro,
  });

  function irParaLogin() {
    Keyboard.dismiss();
    router.replace("/login");
  }

  async function confirmar() {
    Keyboard.dismiss();

    const sucesso = await enviar();

    if (!sucesso) return;

    if (cadastro) {
      router.replace("/login");

      Alert.alert(
        "Conta criada",
        "Agora você pode entrar com seu e-mail e sua senha."
      );
    } else {
      router.replace("/inicio");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {cadastro ? (
            <Pressable
              onPress={irParaLogin}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityLabel="Voltar para o login"
              style={styles.backButton}
            >
              <ArrowLeft size={23} color={colors.text} />
            </Pressable>
          ) : null}

          <View style={styles.brand}>
            <Link2 size={30} color={colors.primary} />

            <Text style={styles.brandName}>BeaconSync</Text>
          </View>
        </View>

        <View style={styles.introduction}>
          <Text style={styles.title}>
            {cadastro ? "Faça parte" : "Cuidar começa"}
            {"\n"}
            <Text style={styles.highlight}>
              {cadastro ? "dessa rede." : "com um elo."}
            </Text>
          </Text>

          <Text style={styles.description}>
            {cadastro
              ? "Crie sua conta para acompanhar e ajudar a proteger quem precisa de você."
              : "Pessoas, apoio e lugares. Tudo conectado para cuidar de quem precisa."}
          </Text>
        </View>

        <View style={styles.form}>
          {!cadastro ? (
            <Text style={styles.formTitle}>Entre na sua conta</Text>
          ) : null}

          {cadastro ? (
            <CampoFormulario
              label="Nome completo"
              value={dados.nome}
              onChangeText={(valor) => alterarCampo("nome", valor)}
              erro={erros.nome}
              placeholder="Como podemos chamar você?"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={150}
              editable={!enviando}
            />
          ) : null}

          <CampoFormulario
            label="E-mail"
            value={dados.email}
            onChangeText={(valor) => alterarCampo("email", valor)}
            erro={erros.email}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            maxLength={254}
            editable={!enviando}
          />

          <CampoFormulario
            label={cadastro ? "Crie uma senha" : "Senha"}
            value={dados.senha}
            onChangeText={(valor) => alterarCampo("senha", valor)}
            erro={erros.senha}
            placeholder={cadastro ? "Crie sua senha" : "Digite sua senha"}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={cadastro ? "new-password" : "current-password"}
            editable={!enviando}
          />

          {cadastro ? (
            <>
              <Text style={styles.passwordHint}>
                Use pelo menos 8 caracteres, com letras e números.
              </Text>

              <CampoFormulario
                label="Confirme a senha"
                value={dados.confirmacaoSenha}
                onChangeText={(valor) =>
                  alterarCampo("confirmacaoSenha", valor)
                }
                erro={erros.confirmacaoSenha}
                placeholder="Digite a senha novamente"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!enviando}
              />
            </>
          ) : null}

          {mensagem ? (
            <View style={styles.messageBox}>
              <Text
                style={styles.messageText}
                accessibilityLiveRegion="polite"
              >
                {mensagem}
              </Text>
            </View>
          ) : null}

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
              (pressed || enviando) && styles.dimmed,
            ]}
          >
            {enviando ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <ArrowRight size={20} color={colors.surface} />
            )}

            <Text style={styles.primaryText}>
              {enviando
                ? "Aguarde..."
                : cadastro
                  ? "Criar minha conta"
                  : "Entrar"}
            </Text>
          </Pressable>
        </View>

        {__DEV__ && !cadastro && (
        <Pressable
         onPress={() => {
          Keyboard.dismiss();
          router.replace("/inicio");
         }}
          disabled={enviando}
         accessibilityRole="button"
         style={styles.testButton}
         >
        <Text style={styles.linkText}>
         Acessar modo de teste
        </Text>
        </Pressable>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {cadastro ? "Já tem uma conta?" : "Ainda não tem conta?"}
          </Text>

          <Pressable
            onPress={
              cadastro
                ? irParaLogin
                : () => router.navigate("/criar-conta")
            }
            disabled={enviando}
            accessibilityRole="button"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              {cadastro ? "Entrar" : "Cadastre-se"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.signature}>
          <ShieldCheck size={17} color={colors.textSecondary} />

          <Text style={styles.signatureText}>
            Cuidado com as pessoas. Respeito aos dados.
          </Text>
        </View>
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
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandName: {
    flexShrink: 1,
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },
  introduction: {
    gap: 16,
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "600",
    color: colors.text,
  },
  highlight: {
    color: colors.primary,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 24,
  },
  passwordHint: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 20,
  },
  messageBox: {
    borderRadius: 12,
    backgroundColor: colors.warningBackground,
    padding: 14,
    marginBottom: 18,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.warningText,
  },
  primaryButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
    textAlign: "center",
  },
  dimmed: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 4,
    marginTop: "auto",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  signature: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  signatureText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  testButton: {
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.primary,
  borderRadius: 14,
  marginBottom: 16,
  },
});