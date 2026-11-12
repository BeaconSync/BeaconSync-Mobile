import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapaBairros from "../components/MapaBairros";
import { mapaBairrosExemplo } from "../data/mapaBairrosExemplos";
import { colors } from "../theme/colors";

import type {
  EstadoMonitoramento,
} from "../types/monitoramento";

import {
  formatarAtualizacao,
  formatarQuantidade,
  legendaMapa,
  prepararBairro,
} from "../utils/mapaBairros";

type Props = {
  estado?: EstadoMonitoramento;
  demonstracao?: boolean;
  onAtualizar?: () => void;
};

const INDISPONIVEL: EstadoMonitoramento = {
  status: "indisponivel",
};

export default function MapaMonitoramentoScreen({
  estado,
  demonstracao = false,
  onAtualizar,
}: Props) {
  const [selecionadoId, setSelecionadoId] =
    useState<string | null>(null);

  const emDemonstracao =
    __DEV__ &&
    demonstracao &&
    estado === undefined;

  const consulta =
    estado ??
    (emDemonstracao
      ? mapaBairrosExemplo
      : INDISPONIVEL);

  const dados =
    consulta.status === "sucesso"
      ? consulta.dados
      : null;

  const bairros = useMemo(
    () => dados?.features.map(prepararBairro) ?? [],
    [dados]
  );

  const selecionado = bairros.find(
    (bairro) => bairro.id === selecionadoId
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Necessidades de apoio por bairro
      </Text>

      <Text style={styles.description}>
        Consulte a quantidade de pessoas cadastradas com
        necessidades de apoio em cada região.
      </Text>

      {emDemonstracao && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Prévia de desenvolvimento: nomes, limites,
            quantidades e classificações são fictícios.
          </Text>
        </View>
      )}

      {consulta.status === "sucesso" &&
      bairros.length > 0 ? (
        <>
          <MapaBairros
            bairros={bairros}
            selecionadoId={selecionado?.id ?? null}
            onSelecionar={setSelecionadoId}
          />

          <Text style={styles.helper}>
            Toque em uma região ou escolha um bairro na
            lista abaixo.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Legenda
            </Text>

            {legendaMapa.map((item) => (
              <View
                key={item.chave ?? "sem-classificacao"}
                style={styles.row}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: item.cor },
                  ]}
                />

                <Text style={styles.label}>
                  {item.rotulo}
                </Text>
              </View>
            ))}

            <Text style={styles.helper}>
              As faixas serão definidas pelo serviço
              responsável pelos dados. As cores não
              representam risco de enchente nem
              confirmação de segurança.
            </Text>
          </View>

          {selecionado && (
            <View
              style={styles.card}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.sectionTitle}>
                {selecionado.nome}
              </Text>

              <View style={styles.row}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: selecionado.cor,
                    },
                  ]}
                />

                <Text style={styles.label}>
                  {selecionado.rotulo}
                </Text>
              </View>

              <Text style={styles.total}>
                {formatarQuantidade(
                  selecionado.totalPessoas
                )}
              </Text>

              <Text style={styles.description}>
                Total de pessoas cadastradas com
                necessidades de apoio
              </Text>

              <Dado
                rotulo="Pessoas idosas"
                valor={formatarQuantidade(
                  selecionado.idosos
                )}
              />

              <Dado
                rotulo="Pessoas com deficiência"
                valor={formatarQuantidade(
                  selecionado.pcds
                )}
              />

              <Text style={styles.helper}>
                Uma pessoa pode aparecer nos dois grupos.
                O total considera cada pessoa uma única vez.
              </Text>

              <Dado
                rotulo="Atualização dos dados"
                valor={formatarAtualizacao(
                  selecionado.atualizadoEm
                )}
              />

              {!selecionado.poligonos.length && (
                <Text style={styles.helper}>
                  Limites geográficos indisponíveis para
                  este bairro.
                </Text>
              )}

              <Pressable
                onPress={() => setSelecionadoId(null)}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>
                  Ver todos os bairros
                </Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            Bairros disponíveis
          </Text>

          {bairros.map((bairro) => (
            <Pressable
              key={bairro.id}
              onPress={() => setSelecionadoId(bairro.id)}
              accessibilityRole="button"
              accessibilityState={{
                selected:
                  selecionado?.id === bairro.id,
              }}
              style={({ pressed }) => [
                styles.card,
                selecionado?.id === bairro.id &&
                  styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: bairro.cor },
                  ]}
                />

                <Text style={styles.bairroTitle}>
                  {bairro.nome}
                </Text>
              </View>

              <Text style={styles.description}>
                Total:{" "}
                {formatarQuantidade(bairro.totalPessoas)}
              </Text>

              <Text style={styles.helper}>
                {bairro.rotulo}
              </Text>

              <Text style={styles.linkText}>
                {selecionado?.id === bairro.id
                  ? "Selecionado · detalhes acima"
                  : "Ver detalhes"}
              </Text>
            </Pressable>
          ))}
        </>
      ) : (
        <View style={styles.card}>
          {consulta.status === "carregando" && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          )}

          <Text style={styles.sectionTitle}>
            {consulta.status === "carregando"
              ? "Carregando mapa"
              : consulta.status === "sucesso"
                ? "Nenhum bairro disponível"
                : "Mapa indisponível"}
          </Text>

          <Text style={styles.description}>
            {consulta.status === "erro"
              ? consulta.mensagem
              : consulta.status === "carregando"
                ? "Aguarde enquanto consultamos as regiões."
                : consulta.status === "sucesso"
                  ? "A consulta não retornou bairros para exibir."
                  : "Os dados serão exibidos quando o serviço de monitoramento estiver conectado."}
          </Text>
        </View>
      )}

      {onAtualizar && !emDemonstracao && (
        <Pressable
          onPress={onAtualizar}
          disabled={consulta.status === "carregando"}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            (pressed ||
              consulta.status === "carregando") &&
              styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {consulta.status === "carregando"
              ? "Atualizando..."
              : "Atualizar dados"}
          </Text>
        </Pressable>
      )}

      <Text style={styles.helper}>
        Dados agrupados por bairro, sem nomes ou
        endereços individuais. A ausência de cadastros
        não significa ausência de pessoas que precisam
        de ajuda.
      </Text>
    </ScrollView>
  );
}

function Dado({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.helper}>{rotulo}</Text>
      <Text style={styles.label}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  label: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bairroTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  total: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
  },
  card: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  field: {
    gap: 4,
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
  button: {
    minHeight: 52,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  secondaryButton: {
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});