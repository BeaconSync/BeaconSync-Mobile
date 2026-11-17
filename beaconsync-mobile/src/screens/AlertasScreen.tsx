import { useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  Info,
  MapPin,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import type {
  Alerta,
  EstadoAlertas,
  FiltroAlertas,
} from "../types/alerta";

import PessoasDoAlerta from "../components/PessoaDoAlerta";

type AlertasScreenProps = {
  estado?: EstadoAlertas;
  demonstracao?: boolean;
  onTentarNovamente?: () => void;
  onAbrirPessoa?: (
    pessoaId: string,
    alerta: Alerta
  ) => void;
};

const LISTA_VAZIA: Alerta[] = [];

const filtros: {
  valor: FiltroAlertas;
  titulo: string;
}[] = [
  { valor: "ativos", titulo: "Ativos" },
  { valor: "encerrados", titulo: "Encerrados" },
  { valor: "todos", titulo: "Todos" },
];

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertasScreen({
  estado = { status: "indisponivel" },
  demonstracao = false,
  onTentarNovamente,
  onAbrirPessoa,
}: AlertasScreenProps) {
  const [filtro, setFiltro] = useState<FiltroAlertas>("ativos");
  const [alertaSelecionadoId, setAlertaSelecionadoId] =
    useState<string | null>(null);

  const aberturaPendente = useRef<{
  pessoaId: string;
  alerta: Alerta;
} | null>(null);

  const alertas =
    estado.status === "sucesso"
      ? estado.alertas
      : LISTA_VAZIA;

  const alertasFiltrados = alertas.filter((alerta) => {
    if (filtro === "todos") return true;

    return alerta.status === (
      filtro === "ativos" ? "ativo" : "encerrado"
    );
  });

  const alertaSelecionado = alertas.find(
    (alerta) => alerta.id === alertaSelecionadoId
  );

  let tituloMensagem = "Informações indisponíveis";
  let descricaoMensagem =
    "Ainda não foi possível consultar os alertas cadastrados.";

  if (estado.status === "carregando") {
    tituloMensagem = "Buscando alertas";
    descricaoMensagem =
      "Aguarde enquanto consultamos as informações.";
  } else if (estado.status === "erro") {
    tituloMensagem = "Não foi possível carregar";
    descricaoMensagem = estado.mensagem;
  } else if (estado.status === "sucesso") {
    if (filtro === "ativos") {
      tituloMensagem = "Nenhum alerta ativo";
      descricaoMensagem =
        "Nenhum alerta ativo foi encontrado nas áreas acompanhadas nesta consulta.";
    } else if (filtro === "encerrados") {
      tituloMensagem = "Nenhum alerta encerrado";
      descricaoMensagem =
        "Os alertas encerrados aparecerão aqui quando estiverem disponíveis.";
    } else {
      tituloMensagem = "Nenhum alerta encontrado";
      descricaoMensagem =
        "Os alertas das áreas acompanhadas aparecerão aqui.";
    }
  }

function fecharDetalhes() {
  aberturaPendente.current = null;
  setAlertaSelecionadoId(null);
}

function concluirAberturaPessoa() {
  const destino = aberturaPendente.current;

  aberturaPendente.current = null;

  if (destino) {
    onAbrirPessoa?.(destino.pessoaId, destino.alerta);
  }
}

function abrirPessoaDoAlerta(pessoaId: string) {
  if (
    !alertaSelecionado ||
    !onAbrirPessoa ||
    aberturaPendente.current
  ) {
    return;
  }

  aberturaPendente.current = {
    pessoaId,
    alerta: alertaSelecionado,
  };

  setAlertaSelecionadoId(null);

  if (Platform.OS !== "ios") {
    concluirAberturaPessoa();
  }
}

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
<View style={styles.content}>
  <FlatList
    style={styles.list}
    data={alertasFiltrados}
    keyExtractor={(alerta) => alerta.id}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
    ItemSeparatorComponent={Separador}
    ListHeaderComponent={
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Alertas</Text>

          <Text style={styles.subtitle}>
            Consulte os alertas cadastrados e confira as regiões abrangidas.
          </Text>
        </View>

        {demonstracao && (
          <View style={styles.notice}>
            <Info size={19} color={colors.infoText} />

            <Text style={styles.noticeText}>
              Prévia de desenvolvimento: os alertas e as
              relações com pessoas abaixo são fictícios.
            </Text>
          </View>
        )}

        <View style={styles.filters}>
          {filtros.map((item) => {
            const selecionado = filtro === item.valor;

            return (
              <Pressable
                key={item.valor}
                onPress={() => setFiltro(item.valor)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: selecionado,
                }}
                style={({ pressed }) => [
                  styles.filter,
                  selecionado && styles.filterSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selecionado && styles.filterTextSelected,
                  ]}
                >
                  {item.titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.notice}>
          <Info size={19} color={colors.infoText} />

          <Text style={styles.noticeText}>
            A ausência de alerta não confirma segurança.
            Mantenha os endereços e as informações atualizados.
          </Text>
        </View>
      </>
    }
    renderItem={({ item }) => (
      <Pressable
        onPress={() => setAlertaSelecionadoId(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Ver alerta: ${item.titulo}`}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <StatusAlerta status={item.status} />

          <ChevronRight
            size={20}
            color={colors.textSecondary}
          />
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>

        <View style={styles.location}>
          <MapPin size={17} color={colors.textSecondary} />

          <Text style={styles.secondaryText}>
            {item.area || "Área não informada"}
          </Text>
        </View>

        <Text
          style={styles.cardDescription}
          numberOfLines={2}
        >
          {item.descricao}
        </Text>

        <Text style={styles.date}>
          Emissão: {formatarData(item.emitidoEm)}
        </Text>
      </Pressable>
    )}
    ListEmptyComponent={
      <View style={styles.messageCard}>
        <View style={styles.messageIcon}>
          {estado.status === "carregando" ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Bell size={28} color={colors.primary} />
          )}
        </View>

        <Text
          style={styles.messageTitle}
          accessibilityLiveRegion="polite"
        >
          {tituloMensagem}
        </Text>

        <Text style={styles.messageDescription}>
          {descricaoMensagem}
        </Text>

        {estado.status === "erro" && onTentarNovamente && (
          <Pressable
            onPress={onTentarNovamente}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Tentar novamente
            </Text>
          </Pressable>
        )}
      </View>
    }
  />
</View>

<Modal
  visible={Boolean(alertaSelecionado)}
  animationType="slide"
  presentationStyle="fullScreen"
  onRequestClose={fecharDetalhes}
  onDismiss={concluirAberturaPessoa}
>
  <SafeAreaProvider style={styles.container}>
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Detalhes do alerta
            </Text>

            <Pressable
              onPress={fecharDetalhes}
              accessibilityRole="button"
              accessibilityLabel="Fechar detalhes do alerta"
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          {alertaSelecionado && (
            <ScrollView
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
            >
              <StatusAlerta status={alertaSelecionado.status} />

              <Text style={styles.detailTitle}>
                {alertaSelecionado.titulo}
              </Text>

              <View style={styles.detailCard}>
                <Informacao
                  titulo="Área"
                  valor={
                    alertaSelecionado.area || "Não informada"
                  }
                />

                <Informacao
                  titulo="Nível informado"
                  valor={
                    alertaSelecionado.nivel || "Não informado"
                  }
                />

                <Informacao
                  titulo="Fonte"
                  valor={
                    alertaSelecionado.fonte || "Não informada"
                  }
                />

                <Informacao
                  titulo="Emissão"
                  valor={formatarData(
                    alertaSelecionado.emitidoEm
                  )}
                />
              </View>

              <Text style={styles.sectionTitle}>
                Sobre o alerta
              </Text>

              <Text style={styles.detailText}>
                {alertaSelecionado.descricao ||
                  "Não há descrição disponível."}
              </Text>

              <PessoasDoAlerta
                estado={alertaSelecionado.pessoasRelacionadas}
                onAbrirPessoa={
                onAbrirPessoa ? abrirPessoaDoAlerta : undefined
               }
              />

              <Text style={styles.sectionTitle}>
                Orientações informadas
              </Text>

              {alertaSelecionado.orientacoes.length > 0 ? (
                <View style={styles.guidanceList}>
                  {alertaSelecionado.orientacoes.map(
                    (orientacao, indice) => (
                      <View
                        key={`${indice}-${orientacao}`}
                        style={styles.guidance}
                      >
                        <Text style={styles.guidanceNumber}>
                          {indice + 1}.
                        </Text>

                        <Text style={styles.guidanceText}>
                          {orientacao}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ) : (
                <Text style={styles.detailText}>
                  Nenhuma orientação foi disponibilizada
                  para este alerta.
                </Text>
              )}

              <View style={styles.notice}>
                <Info size={19} color={colors.infoText} />

                <Text style={styles.noticeText}>
                  {alertaSelecionado.status === "encerrado"
                    ? "O encerramento deste alerta não confirma a segurança de uma pessoa ou endereço."
                    : "Este alerta informa uma situação na região. Ele não confirma a localização nem a condição de cada pessoa acompanhada."}
                </Text>
              </View>

              <Pressable
                onPress={fecharDetalhes}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  Voltar para alertas
                </Text>
              </Pressable>
                      </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>
    </SafeAreaView>
  );
}

function StatusAlerta({
  status,
}: {
  status: Alerta["status"];
}) {
  const ativo = status === "ativo";

  return (
    <View
      style={[
        styles.badge,
        ativo ? styles.badgeActive : styles.badgeClosed,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: ativo
              ? colors.warningText
              : colors.infoText,
          },
        ]}
      >
        {ativo ? "Ativo" : "Encerrado"}
      </Text>
    </View>
  );
}

function Informacao({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.information}>
      <Text style={styles.informationLabel}>{titulo}</Text>
      <Text style={styles.informationValue}>{valor}</Text>
    </View>
  );
}

function Separador() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  filters: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filter: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  filterSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.infoBackground,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.infoText,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  card: {
    padding: 18,
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: colors.warningBackground,
  },
  badgeClosed: {
    backgroundColor: colors.infoBackground,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  date: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  messageCard: {
    alignItems: "center",
    gap: 14,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  messageIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  messageDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSecondary,
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
modalHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  paddingHorizontal: 20,
  paddingVertical: 12,
  backgroundColor: colors.background,
},
modalTitle: {
  flex: 1,
  flexShrink: 1,
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
},
closeButton: {
  width: 48,
  height: 48,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
},
  detailContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  detailCard: {
    padding: 18,
    gap: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  information: {
    gap: 5,
  },
  informationLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  informationValue: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 24,
  },
  guidanceList: {
    gap: 12,
    marginBottom: 24,
  },
  guidance: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  guidanceNumber: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.primary,
  },
  guidanceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
});