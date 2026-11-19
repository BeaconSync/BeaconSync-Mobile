import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AnaliseDistritoCard from "./AnaliseDistritoCard";
import MapaBairros from "./MapaBairros";

import distritosSP from "../data/distritosSP.json";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";
import { prepararBairro } from "../utils/mapaBairros";

import type {
  CorDistrito,
  MapaAlerta,
} from "../services/mapaAlerta";

import type {
  GeometriaBairro,
} from "../types/monitoramento";

type Props = {
  mapa: MapaAlerta;
};

type BaseDistritos = {
  features: {
    properties: {
      nome: string;
    };
    geometry: GeometriaBairro;
  }[];
};

const base = distritosSP as unknown as BaseDistritos;

const faixas: Record<
  CorDistrito,
  { cor: string; rotulo: string }
> = {
  AZUL: {
    cor: "#3275A8",
    rotulo: "Faixa azul",
  },
  AMARELO: {
    cor: "#E5B833",
    rotulo: "Faixa amarela",
  },
  LARANJA: {
    cor: "#D77A28",
    rotulo: "Faixa laranja",
  },
  VERMELHO: {
    cor: "#C64B40",
    rotulo: "Faixa vermelha",
  },
};

const semDados = {
  cor: "#8A9099",
  rotulo: "Sem dados neste alerta",
};

function normalizarNome(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export default function MapaDistritosAlerta({
  mapa,
}: Props) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [selecionadoId, setSelecionadoId] =
    useState<string | null>(null);

  const { regioes, semLimite } = useMemo(() => {
    const porNome = new Map(
      mapa.distritos.map((distrito) => [
        normalizarNome(distrito.nome),
        distrito,
      ]),
    );

    const nomesDaBase = new Set(
      base.features.map((item) =>
        normalizarNome(item.properties.nome),
      ),
    );

    const regioesPreparadas = base.features.map(
      (feature) => {
        const nome = feature.properties.nome;
        const chave = normalizarNome(nome);
        const distrito = porNome.get(chave);

        const visual = distrito
          ? faixas[distrito.cor]
          : semDados;

        const regiao = prepararBairro({
          type: "Feature",
          geometry: feature.geometry,
          properties: {
            id: distrito?.id ?? `limite-${chave}`,
            nome: distrito?.nome ?? nome,
            totalPessoas: distrito?.total ?? null,
            idosos: null,
            pcds: null,
            classificacao: null,
            atualizadoEm: null,
          },
        });

        return {
          ...regiao,
          cor: visual.cor,
          rotulo: visual.rotulo,
        };
      },
    );

    return {
      regioes: regioesPreparadas,
      semLimite: mapa.distritos.filter(
        (distrito) =>
          !nomesDaBase.has(
            normalizarNome(distrito.nome),
          ),
      ),
    };
  }, [mapa.distritos]);

  const distritoSelecionado = mapa.distritos.find(
    (distrito) => distrito.id === selecionadoId,
  );

  const regiaoSelecionada = regioes.find(
    (regiao) => regiao.id === selecionadoId,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Mapa dos distritos
      </Text>

      <Text style={styles.text}>
        Toque em um distrito ou selecione uma região
        abaixo para consultar os dados.
      </Text>

      <MapaBairros
        bairros={regioes}
        selecionadoId={selecionadoId}
        onSelecionar={setSelecionadoId}
      />

      <Text style={styles.source}>
        Limites: GeoSampa / Prefeitura de São Paulo.
        Geometria simplificada para visualização.
      </Text>

      {selecionadoId !== null && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setSelecionadoId(null)}
          style={styles.button}
        >
          <Text style={styles.link}>
            Ver todos os distritos
          </Text>
        </Pressable>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Legenda</Text>

        {[...Object.values(faixas), semDados].map(
          (faixa) => (
            <View
              key={faixa.rotulo}
              style={styles.legendRow}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: faixa.cor },
                ]}
              />

              <Text style={styles.text}>
                {faixa.rotulo}
              </Text>
            </View>
          ),
        )}

        <Text style={styles.text}>
          As faixas são definidas pelo Java. Cinza
          significa ausência de dados neste alerta,
          e não ausência de pessoas. Nenhuma cor
          confirma segurança.
        </Text>
      </View>

      {semLimite.length > 0 && (
        <Text style={styles.text}>
          Não encontramos o limite geográfico de:{" "}
          {semLimite
            .map((distrito) => distrito.nome)
            .join(", ")}
          . Os dados continuam disponíveis na seleção
          abaixo.
        </Text>
      )}

      <Text style={styles.title}>
        Distritos deste alerta
      </Text>

      {mapa.distritos.length === 0 && (
        <Text style={styles.text}>
          Este alerta não retornou distritos.
        </Text>
      )}

      <View style={styles.options}>
        {mapa.distritos.map((distrito) => {
          const selecionado =
            distrito.id === selecionadoId;

          return (
            <Pressable
              key={distrito.id}
              accessibilityRole="button"
              accessibilityState={{
                selected: selecionado,
              }}
              onPress={() =>
                setSelecionadoId(distrito.id)
              }
              style={({ pressed }) => [
                styles.button,
                selecionado && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.link}>
                {distrito.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {distritoSelecionado ? (
        <View style={styles.card}>
          <Text style={styles.title}>
            {distritoSelecionado.nome}
          </Text>

          <Text style={styles.text}>
            Pessoas em acompanhamento:{" "}
            {distritoSelecionado.total}
          </Text>

          <Text style={styles.text}>
            Respostas pendentes:{" "}
            {distritoSelecionado.pendentes}
          </Text>

          <Text style={styles.text}>
            Precisam de ajuda:{" "}
            {distritoSelecionado.precisamAjuda}
          </Text>

          <Text style={styles.text}>
            Sem contato:{" "}
            {distritoSelecionado.semContato}
          </Text>

          <AnaliseDistritoCard
            key={[
              mapa.alertaId,
              distritoSelecionado.id,
              distritoSelecionado.pendentes,
              distritoSelecionado.precisamAjuda,
              distritoSelecionado.semContato,
            ].join("-")}
            alertaId={mapa.alertaId}
            distritoId={distritoSelecionado.id}
          />
        </View>
      ) : regiaoSelecionada ? (
        <View style={styles.card}>
          <Text style={styles.title}>
            {regiaoSelecionada.nome}
          </Text>

          <Text style={styles.text}>
            Este distrito não foi retornado neste
            alerta. Não há contagens disponíveis para
            apresentar ou enviar à análise.
          </Text>
        </View>
      ) : (
        <Text style={styles.text}>
          Selecione um distrito para consultar as
          contagens e solicitar a análise da IA.
        </Text>
      )}
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  source: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  card: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  options: {
    gap: 8,
  },
  button: {
    minHeight: 48,
    padding: 14,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
}));