import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapaDistritosAlerta from "./MapaDistritosAlerta";
import { useConsultaMonitoramento } from "../hooks/useConsultaMonitoramento";
import { consultarAlertas } from "../services/alertas";

import {
  consultarMapaAlerta,
  type CorDistrito,
} from "../services/mapaAlerta";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

const faixas: Record<
  CorDistrito,
  { nome: string; cor: string }
> = {
  AZUL: {
    nome: "Faixa azul",
    cor: "#2879A8",
  },
  AMARELO: {
    nome: "Faixa amarela",
    cor: "#A68100",
  },
  LARANJA: {
    nome: "Faixa laranja",
    cor: "#C46A16",
  },
  VERMELHO: {
    nome: "Faixa vermelha",
    cor: "#B83D3D",
  },
};

export default function MonitoramentoConectado() {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [alertaId, setAlertaId] =
    useState<string | null>(null);

  const { estado, recarregar } =
    useConsultaMonitoramento(consultarAlertas);

  if (alertaId) {
    return (
      <DistritosDoAlerta
        key={alertaId}
        id={alertaId}
        onVoltar={() => setAlertaId(null)}
      />
    );
  }

  const ativos =
    estado.status === "sucesso"
      ? estado.dados.filter(
          (item) => item.status === "ativo"
        )
      : [];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        Acompanhamento por distrito
      </Text>

      <Text style={styles.text}>
        Escolha um alerta ativo para consultar as contagens
        por região.
      </Text>

      {estado.status === "carregando" && (
        <ActivityIndicator
          accessibilityLabel="Carregando alertas"
          color={colors.primary}
        />
      )}

      {estado.status === "erro" && (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {estado.mensagem}
        </Text>
      )}

      {estado.status === "indisponivel" && (
        <Text style={styles.text}>
          Entre na sua conta para consultar os alertas.
        </Text>
      )}

      {estado.status === "sucesso" &&
        ativos.length === 0 && (
          <Text style={styles.text}>
            Nenhum alerta ativo foi encontrado.
          </Text>
        )}

      {ativos.map((alerta) => (
        <Pressable
          key={alerta.id}
          onPress={() => setAlertaId(alerta.id)}
          accessibilityRole="button"
          accessibilityLabel={`Consultar ${alerta.titulo}`}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.subtitle}>
            {alerta.titulo}
          </Text>

          <Text style={styles.text}>
            {alerta.area || "Região não informada"}
          </Text>

          <Text style={styles.link}>
            Consultar distritos
          </Text>
        </Pressable>
      ))}

      {estado.status !== "carregando" &&
        estado.status !== "indisponivel" && (
          <Botao
            texto="Atualizar alertas"
            onPress={recarregar}
          />
        )}
    </ScrollView>
  );
}

function DistritosDoAlerta({
  id,
  onVoltar,
}: {
  id: string;
  onVoltar: () => void;
}) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const consultar = useCallback(
    () => consultarMapaAlerta(id),
    [id]
  );

  const { estado, recarregar } =
    useConsultaMonitoramento(consultar);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Botao
        texto="Escolher outro alerta"
        onPress={onVoltar}
      />

      <Text style={styles.title}>
        Contagens por distrito
      </Text>

      {estado.status === "carregando" && (
        <ActivityIndicator
          accessibilityLabel="Carregando distritos"
          color={colors.primary}
        />
      )}

      {estado.status === "erro" && (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {estado.mensagem}
        </Text>
      )}

      {estado.status === "indisponivel" && (
        <Text style={styles.text}>
          Entre na sua conta para consultar o monitoramento.
        </Text>
      )}

      {estado.status === "sucesso" && (
        <>
          <Text style={styles.subtitle}>
            {estado.dados.titulo}
          </Text>

          {estado.dados.status === "ENCERRADO" && (
            <Text style={styles.text}>
              Este alerta foi encerrado. As contagens abaixo
              são referentes a ele.
            </Text>
          )}

          <View style={styles.card}>
            <Text style={styles.total}>
              {estado.dados.total}
            </Text>

            <Text style={styles.subtitle}>
              Pessoas em acompanhamento neste alerta
            </Text>

            <Text style={styles.text}>
              Soma de respostas pendentes, pedidos de ajuda
              e pessoas sem contato. Pessoas informadas como
              seguras ou resgatadas não entram nesse total.
            </Text>
          </View>

          <Text style={styles.text}>
            As cores seguem as faixas de quantidade definidas
            pelo serviço. Elas não indicam o nível de enchente
            nem confirmam segurança.
          </Text>

          <MapaDistritosAlerta
  key={estado.dados.alertaId}
  mapa={estado.dados}
/>

          {estado.dados.distritos.length === 0 && (
            <Text style={styles.text}>
              Este alerta não retornou distritos.
            </Text>
          )}

          {estado.dados.distritos.map((distrito) => {
            const faixa = faixas[distrito.cor];

            return (
              <View
                key={distrito.id}
                style={styles.card}
              >
                <Text style={styles.subtitle}>
                  {distrito.nome}
                </Text>

                <Text
                  style={[
                    styles.link,
                    { color: faixa.cor },
                  ]}
                >
                  {faixa.nome}
                </Text>

                <Text style={styles.total}>
                  {distrito.total}
                </Text>

                <Text style={styles.text}>
                  Respostas pendentes: {distrito.pendentes}
                </Text>

                <Text style={styles.text}>
                  Precisam de ajuda: {distrito.precisamAjuda}
                </Text>

                <Text style={styles.text}>
                  Sem contato: {distrito.semContato}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {estado.status !== "carregando" &&
        estado.status !== "indisponivel" && (
          <Botao
            texto="Atualizar contagens"
            onPress={recarregar}
          />
        )}
    </ScrollView>
  );
}

function Botao({
  texto,
  onPress,
}: {
  texto: string;
  onPress: () => void;
}) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.link}>{texto}</Text>
    </Pressable>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 18,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  text: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  total: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
  },
  card: {
    padding: 18,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    minHeight: 48,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  error: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.warningText,
  },
  pressed: {
    opacity: 0.7,
  },
}));