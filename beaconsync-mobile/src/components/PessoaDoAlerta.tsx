import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../theme/colors";
import type {
  EstadoPessoasRelacionadas,
  PessoaRelacionadaAlerta,
} from "../types/alerta";

type Props = {
  estado?: EstadoPessoasRelacionadas;
  onAbrirPessoa?: (pessoaId: string) => void;
};

function textoSituacao(
  situacao: PessoaRelacionadaAlerta["situacao"]
) {
  switch (situacao) {
    case "Seguro":
      return "Informada como segura";
    case "Precisa de Ajuda":
      return "Precisa de ajuda";
    case "Sem Contato":
      return "Sem contato";
    default:
      return "Sem resposta registrada";
  }
}

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  return Number.isNaN(data.getTime())
    ? "Data não informada"
    : data.toLocaleString("pt-BR");
}

export default function PessoasDoAlerta({
  estado = { status: "indisponivel" },
  onAbrirPessoa,
}: Props) {
  let mensagem = "";

  if (estado.status === "indisponivel") {
    mensagem =
      "Ainda não foi possível consultar as pessoas relacionadas a este alerta.";
  } else if (estado.status === "carregando") {
    mensagem = "Buscando pessoas relacionadas...";
  } else if (estado.status === "erro") {
    mensagem = estado.mensagem;
  } else if (estado.pessoas.length === 0) {
    mensagem =
      "Nenhuma pessoa acompanhada foi relacionada a este alerta nesta consulta.";
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Pessoas relacionadas</Text>

      <Text style={styles.description}>
        Pessoas que você acompanha relacionadas à área deste
        alerta. O endereço de referência não confirma a presença
        atual da pessoa.
      </Text>

      {mensagem ? (
        <View style={styles.card}>
          {estado.status === "carregando" && (
            <ActivityIndicator color={colors.primary} />
          )}

          <Text
            style={styles.description}
            accessibilityLiveRegion="polite"
          >
            {mensagem}
          </Text>
        </View>
      ) : null}

      {estado.status === "sucesso" &&
        estado.pessoas.map((pessoa) => (
          <View key={pessoa.id} style={styles.card}>
            <Text style={styles.name}>{pessoa.nome}</Text>

            <Text style={styles.description}>
              Referência:{" "}
              {pessoa.localReferencia || "Não informada"}
            </Text>

            <View style={styles.response}>
              <Text style={styles.label}>
                Resposta neste alerta
              </Text>

              <Text style={styles.responseText}>
                {textoSituacao(pessoa.situacao)}
              </Text>

              {pessoa.situacao !== null && (
                <Text style={styles.description}>
                  {formatarData(pessoa.dataResposta)}
                </Text>
              )}
            </View>

            {onAbrirPessoa && (
              <Pressable
                onPress={() => onAbrirPessoa(pessoa.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ver cadastro de ${pessoa.nome}`}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  Ver pessoa acompanhada
                </Text>
              </Pressable>
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  response: {
    padding: 12,
    gap: 6,
    borderRadius: 10,
    backgroundColor: colors.infoBackground,
  },
  label: {
    fontSize: 12,
    color: colors.infoText,
  },
  responseText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.infoText,
  },
  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});