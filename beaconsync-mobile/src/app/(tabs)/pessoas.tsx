import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SolicitarVinculoConectado from "../../components/SolicitarVinculoConectado";
import MinhasSolicitacoesConectadas from "../../components/MinhasSolicitacoesConectadas";
import SolicitacoesRecebidasConectadas from "../../components/SolicitacoesRecebidasConectadas";

import { usePessoasAcompanhadas } from "../../hooks/usePessoasAcompanhadas";
import PessoasScreen from "../../screens/PessoasScreen";

import {
  useTema,
  usarEstilosTema,
  type Cores,
} from "../../theme/tema";

type Painel =
  | "solicitar-vinculo"
  | "minhas-solicitacoes"
  | "solicitacoes-recebidas"
  | null;

export default function PessoasRoute() {
  const router = useRouter();

  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const { estado, recarregar } = usePessoasAcompanhadas();
  const [painel, setPainel] = useState<Painel>(null);

  function abrirPessoa(id: string) {
    router.push({
      pathname: "/pessoa/[id]",
      params: { id },
    });
  }

  function fecharSolicitacoes() {
    setPainel(null);
    void recarregar();
  }

  return (
    <View style={styles.container}>
      <PessoasScreen
        estado={estado}
        onTentarNovamente={() => {
          void recarregar();
        }}
        onCadastrar={() => {
          router.push("/cadastrar-pessoa");
        }}
        onAbrirPessoa={(pessoa) => {
          abrirPessoa(pessoa.id);
        }}
        rodape={
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Solicitações de vínculo
            </Text>

            <View style={styles.card}>
              <Text style={styles.description}>
                Solicite acesso para acompanhar uma pessoa,
                acompanhe seus pedidos e consulte as
                solicitações que você pode analisar.
              </Text>

              <Pressable
                onPress={() => {
                  setPainel("solicitar-vinculo");
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  Solicitar vínculo
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setPainel("minhas-solicitacoes");
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  Minhas solicitações
                </Text>
              </Pressable>

              {estado.status === "sucesso" && (
                <Pressable
                  onPress={() => {
                    setPainel("solicitacoes-recebidas");
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    Solicitações recebidas
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        }
      />

      {painel === "solicitar-vinculo" && (
        <SolicitarVinculoConectado
          onFechar={() => setPainel(null)}
          onConcluido={() => setPainel(null)}
        />
      )}

      {painel === "minhas-solicitacoes" && (
        <MinhasSolicitacoesConectadas
          onFechar={fecharSolicitacoes}
        />
      )}

      {painel === "solicitacoes-recebidas" && (
        <SolicitacoesRecebidasConectadas
          onFechar={fecharSolicitacoes}
        />
      )}
    </View>
  );
}

const criarStyles = (colors: Cores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      marginTop: 28,
      gap: 14,
    },
    sectionTitle: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      color: colors.text,
    },
    card: {
      padding: 20,
      gap: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    description: {
      fontSize: 14,
      lineHeight: 23,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    button: {
      minHeight: 52,
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    buttonText: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      textAlign: "center",
      color: colors.primary,
    },
    pressed: {
      opacity: 0.7,
    },
  });