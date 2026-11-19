import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  analisarDistrito,
  type AnaliseDistrito,
} from "../services/analiseDistrito";

import { versaoSessao } from "../services/sessao";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

type Props = {
  alertaId: string;
  distritoId: string;
};

export default function AnaliseDistritoCard({
  alertaId,
  distritoId,
}: Props) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [resultado, setResultado] =
    useState<AnaliseDistrito | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const trava = useRef(false);
  const geracao = useRef(0);

  useEffect(() => {
    geracao.current += 1;
    setResultado(null);
    setErro(null);
    setCarregando(false);
    trava.current = false;

    return () => {
      geracao.current += 1;
    };
  }, [alertaId, distritoId]);

  async function consultar() {
    if (trava.current) return;

    trava.current = true;

    const consulta = geracao.current;
    const sessao = versaoSessao();

    const atual = () =>
      consulta === geracao.current &&
      sessao === versaoSessao();

    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const resposta = await analisarDistrito(
        alertaId,
        distritoId,
      );

      if (atual()) setResultado(resposta);
    } catch (falha) {
      if (atual()) {
        setErro(
          falha instanceof Error
            ? falha.message
            : "Não foi possível consultar a análise.",
        );
      }
    } finally {
      if (consulta === geracao.current) {
        trava.current = false;
        setCarregando(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => void consultar()}
        disabled={carregando}
        accessibilityRole="button"
        accessibilityState={{
          disabled: carregando,
          busy: carregando,
        }}
        style={({ pressed }) => [
          styles.button,
          (pressed || carregando) && styles.disabled,
        ]}
      >
        {carregando && (
          <ActivityIndicator color={colors.primary} />
        )}

        <Text style={styles.buttonText}>
          {carregando
            ? "Consultando análise..."
            : resultado
              ? "Atualizar análise"
              : "Analisar com IA"}
        </Text>
      </Pressable>

      {erro && (
        <Text accessibilityRole="alert" style={styles.error}>
          {erro}
        </Text>
      )}

      {resultado && (
        <>
          <Text style={styles.title}>
            {resultado.status === "DEMONSTRACAO"
              ? "Análise de demonstração"
              : resultado.status === "SEM_BASE"
                ? "Análise com base insuficiente"
                : "Análise gerada por IA"}
          </Text>

          <Text style={styles.text}>
            {resultado.boletim_dados}
          </Text>

          <Text selectable style={styles.text}>
            {resultado.analise}
          </Text>

          {resultado.avisos.map((aviso, indice) => (
            <Text key={indice} style={styles.text}>
              {aviso}
            </Text>
          ))}

          <Text style={styles.helper}>
            Gerada em{" "}
            {new Date(resultado.gerado_em).toLocaleString("pt-BR")}
          </Text>

          <Text style={styles.helper}>
            A análise pode conter erros. Ela não confirma
            segurança nem o envio de uma equipe de resgate.
          </Text>
        </>
      )}
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 12,
  },
  button: {
    minHeight: 48,
    padding: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  buttonText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  text: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.warningText,
  },
  disabled: {
    opacity: 0.6,
  },
}));