import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CardPessoa from "../components/CardPessoa";
import { colors } from "../theme/colors";
import type { EstadoAlertas } from "../types/alerta";
import type { EstadoPessoas, PessoaResumo } from "../types/pessoa";

type InicioScreenProps = {
  nomeUsuario?: string;
  estadoPessoas?: EstadoPessoas;
  estadoAlertas?: EstadoAlertas;
  demonstracao?: boolean;
  atualizando?: boolean;
  onAtualizar?: () => void;
  onAbrirPerfil: () => void;
  onAbrirPessoas: () => void;
  onCadastrarPessoa: () => void;
  onAbrirPessoa: (pessoa: PessoaResumo) => void;
  onAbrirAlertas: () => void;
  onAbrirMinhasSolicitacoes: () => void;
  onAbrirSolicitacoesRecebidas: () => void;
};

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
};

function Botao({
  titulo,
  onPress,
  secundario = false,
}: BotaoProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        secundario && styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secundario && styles.secondaryButtonText,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

export default function InicioScreen({
  nomeUsuario,
  estadoPessoas = { status: "indisponivel" },
  estadoAlertas = { status: "indisponivel" },
  demonstracao = false,
  atualizando = false,
  onAtualizar,
  onAbrirPerfil,
  onAbrirPessoas,
  onCadastrarPessoa,
  onAbrirPessoa,
  onAbrirAlertas,
  onAbrirMinhasSolicitacoes,
  onAbrirSolicitacoesRecebidas,
}: InicioScreenProps) {
  const nome = nomeUsuario?.trim();
  const primeiroNome = nome?.split(/\s+/)[0];

  const iniciais = nome
    ? nome
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase()
    : "—";

  const pessoas =
    estadoPessoas.status === "sucesso"
      ? estadoPessoas.pessoas
      : [];

  const alertasAtivos =
    estadoAlertas.status === "sucesso"
      ? estadoAlertas.alertas.filter(
          (alerta) => alerta.status === "ativo"
        )
      : [];

  const primeiroAlerta = alertasAtivos[0];
  const temAlertaAtivo = alertasAtivos.length > 0;

  let tituloAlertas = "Áreas acompanhadas";
  let descricaoAlertas =
    "As informações sobre alertas ainda não estão disponíveis.";

  if (estadoAlertas.status === "carregando") {
    tituloAlertas = "Consultando alertas";
    descricaoAlertas = "Aguarde enquanto buscamos os avisos.";
  } else if (estadoAlertas.status === "erro") {
    tituloAlertas = "Não foi possível consultar os alertas";
    descricaoAlertas = estadoAlertas.mensagem;
  } else if (estadoAlertas.status === "sucesso") {
    if (primeiroAlerta) {
      tituloAlertas = primeiroAlerta.titulo;
      descricaoAlertas = primeiroAlerta.area
        ? `Área informada: ${primeiroAlerta.area}`
        : primeiroAlerta.descricao;
    } else {
      descricaoAlertas =
        "Nenhum alerta ativo retornado para as áreas acompanhadas.";
    }
  }

  let tituloPessoas = "Informações indisponíveis";
  let descricaoPessoas =
    "Ainda não foi possível consultar as pessoas que você acompanha.";

  if (estadoPessoas.status === "carregando") {
    tituloPessoas = "Carregando pessoas";
    descricaoPessoas = "Aguarde enquanto buscamos os cadastros.";
  } else if (estadoPessoas.status === "erro") {
    tituloPessoas = "Não foi possível carregar";
    descricaoPessoas = estadoPessoas.mensagem;
  } else if (estadoPessoas.status === "sucesso") {
    tituloPessoas = "Você ainda não acompanha nenhuma pessoa";
    descricaoPessoas =
      "Cadastre alguém para começar a acompanhar suas informações e necessidades de apoio.";
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
  contentContainerStyle={styles.content}
  showsVerticalScrollIndicator={false}
  refreshControl={
    onAtualizar && !demonstracao ? (
      <RefreshControl
        refreshing={atualizando}
        onRefresh={onAtualizar}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ) : undefined
  }
>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandInitials}>BS</Text>
            </View>

            <View style={styles.brandText}>
              <Text style={styles.brandName}>BeaconSync</Text>
              <Text style={styles.brandSubtitle}>
                Conectando cuidado
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onAbrirPerfil}
            accessibilityRole="button"
            accessibilityLabel="Abrir meu perfil"
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.avatarText}>{iniciais}</Text>
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.title}>
            {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
          </Text>

          <Text style={styles.subtitle}>
            Acompanhe quem precisa de você.
          </Text>
        </View>

        {demonstracao && (
          <View style={styles.demoBox}>
            <Text style={styles.infoFootnote}>
              Prévia de desenvolvimento: este cenário é fictício.
              Nenhuma consulta real foi realizada.
            </Text>
          </View>
        )}

        <View
          style={[
            styles.infoCard,
            temAlertaAtivo && styles.warningCard,
          ]}
        >
          {estadoAlertas.status === "carregando" && (
            <ActivityIndicator color={colors.primary} />
          )}

          <Text
            style={[
              styles.infoTitle,
              temAlertaAtivo && styles.warningText,
            ]}
          >
            {tituloAlertas}
          </Text>

          <Text style={styles.infoDescription}>
            {descricaoAlertas}
          </Text>

          {temAlertaAtivo && (
            <Text style={styles.warningText}>
              {alertasAtivos.length}{" "}
              {alertasAtivos.length === 1
                ? "alerta ativo"
                : "alertas ativos"}
            </Text>
          )}

          <Botao
            titulo={temAlertaAtivo ? "Ver alertas" : "Abrir alertas"}
            onPress={onAbrirAlertas}
            secundario={!temAlertaAtivo}
          />

          <Text style={styles.infoFootnote}>
            A ausência de alerta não confirma segurança.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pessoas acompanhadas
          </Text>

          {estadoPessoas.status === "sucesso" && (
            <Text
              style={styles.counter}
              accessibilityLabel={`${pessoas.length} pessoas acompanhadas`}
            >
              {pessoas.length}
            </Text>
          )}
        </View>

        {estadoPessoas.status === "sucesso" &&
        pessoas.length > 0 ? (
          <View style={styles.cards}>
            {pessoas.slice(0, 3).map((pessoa) => (
              <CardPessoa
                key={pessoa.id}
                pessoa={pessoa}
                onPress={() => onAbrirPessoa(pessoa)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            {estadoPessoas.status === "carregando" && (
              <ActivityIndicator color={colors.primary} />
            )}

            <Text style={styles.cardTitle}>
              {tituloPessoas}
            </Text>

            <Text style={styles.description}>
              {descricaoPessoas}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Botao
            titulo="+ Cadastrar pessoa"
            onPress={onCadastrarPessoa}
          />

          <Botao
            titulo="Ver todas as pessoas"
            onPress={onAbrirPessoas}
            secundario
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Solicitações de vínculo
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            Acompanhe seus pedidos de acesso e consulte as
            solicitações que você pode analisar.
          </Text>

          <Botao
            titulo="Minhas solicitações"
            onPress={onAbrirMinhasSolicitacoes}
            secundario
          />

          <Botao
            titulo="Solicitações recebidas"
            onPress={onAbrirSolicitacoesRecebidas}
            secundario
          />
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
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandText: {
    flex: 1,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  brandInitials: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  brandName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  greeting: {
    marginTop: 28,
    marginBottom: 24,
    gap: 6,
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
  demoBox: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: colors.infoBackground,
  },
  infoCard: {
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.infoBackground,
    borderColor: colors.infoBorder,
  },
  warningCard: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.infoText,
  },
  infoDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  infoFootnote: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.infoText,
  },
  warningText: {
    color: colors.warningText,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
  },
  counter: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    textAlign: "center",
    fontSize: 13,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cards: {
    gap: 12,
  },
  card: {
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});