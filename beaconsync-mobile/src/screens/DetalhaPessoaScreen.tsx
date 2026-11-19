import { useState, type ReactNode } from "react";
import { Info, MapPin, Pencil, UserRound } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";
import type {
  EstadoDetalhesPessoa,
  PessoaDetalhes,
} from "../types/detalhaPessoa";
type Props = {
  estado: EstadoDetalhesPessoa;
  demonstracao?: boolean;
  onVoltar: () => void;
  onEditar?: () => void;
  onInformarSituacao?: () => void;
  onAbrirExclusao?: () => void;
  onPararAcompanhamento?: () => void;
  onVerVinculos?: () => void;
  onGerenciarEnderecos?: () => void;
  onTentarNovamente?: () => void;
};
function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  return (
    partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
}
function obterNascimento(valor: string | null) {
  if (!valor) return null;
  const resultado = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(valor);
  if (!resultado) return null;
  const ano = Number(resultado[1]);
  const mes = Number(resultado[2]);
  const dia = Number(resultado[3]);
  if (ano < 1) return null;
  const data = new Date(0);
  data.setUTCHours(0, 0, 0, 0);
  data.setUTCFullYear(ano, mes - 1, dia);
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null;
  }
  const hoje = new Date();
  const nascimentoNumerico = ano * 10000 + mes * 100 + dia;
  const hojeNumerico =
    hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate();
  if (nascimentoNumerico > hojeNumerico) return null;
  let idade = hoje.getFullYear() - ano;
  if (
    hoje.getMonth() + 1 < mes ||
    (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
  ) {
    idade -= 1;
  }
  return {
    data: `${resultado[3]}/${resultado[2]}/${resultado[1]}`,
    idade:
      idade === 0
        ? "Menos de 1 ano"
        : `${idade} ${idade === 1 ? "ano" : "anos"}`,
  };
}
function formatarMomento(valor?: string | null) {
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
export default function DetalhesPessoaScreen({
  estado,
  demonstracao = false,
  onVoltar,
  onEditar,
  onAbrirExclusao,
  onTentarNovamente,
  onInformarSituacao,
  onPararAcompanhamento,
  onVerVinculos,
  onGerenciarEnderecos,
}: Props) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  if (estado.status !== "sucesso") {
    let titulo = "Informações indisponíveis";
    let descricao = "Não foi possível consultar os dados desta pessoa.";
    if (estado.status === "carregando") {
      titulo = "Carregando pessoa";
      descricao = "Aguarde enquanto buscamos as informações.";
    } else if (estado.status === "nao_encontrada") {
      titulo = "Cadastro não encontrado";
      descricao =
        "Este cadastro não foi encontrado ou não está disponível para sua conta.";
    } else if (estado.status === "erro") {
      titulo = "Não foi possível carregar";
      descricao = estado.mensagem;
    }
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyCard}>
            {estado.status === "carregando" ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <UserRound size={36} color={colors.primary} />
            )}
            <Text style={styles.emptyTitle}>{titulo}</Text>
            <Text style={styles.emptyDescription}>{descricao}</Text>
            {estado.status === "erro" && onTentarNovamente && (
              <Botao texto="Tentar novamente" onPress={onTentarNovamente} />
            )}
          </View>
          <Botao texto="Voltar para pessoas" secundario onPress={onVoltar} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  const { pessoa } = estado;
  const nascimento = obterNascimento(pessoa.dataNascimento);
  const situacao = pessoa.situacao;
  const corSituacao =
    situacao?.status === "Seguro"
      ? colors.success
      : situacao?.status === "Precisa de Ajuda"
        ? colors.danger
        : situacao?.status === "Sem Contato"
          ? colors.warningText
          : colors.infoText;
  const fundoSituacao =
    situacao?.status === "Seguro"
      ? colors.successBackground
      : situacao?.status === "Precisa de Ajuda"
        ? colors.dangerBackground
        : situacao?.status === "Sem Contato"
          ? colors.primaryLight
          : colors.infoBackground;
  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {demonstracao && (
          <Aviso texto="Prévia de desenvolvimento: esta pessoa é fictícia. Nenhum cadastro foi salvo." />
        )}
        <View style={styles.profile}>
          <AvatarPessoa
            key={`${pessoa.id}-${pessoa.fotoUrl ?? ""}`}
            nome={pessoa.nome}
            fotoUrl={pessoa.fotoUrl}
          />
          <Text style={styles.name}>{pessoa.nome}</Text>
          <Text style={styles.profileDescription}>
            {nascimento?.idade ?? "Idade não informada"}
            {pessoa.vinculo ? ` · ${pessoa.vinculo}` : ""}
          </Text>
        </View>
        <Pressable
          onPress={onEditar}
          disabled={!onEditar}
          accessibilityRole="button"
          accessibilityLabel="Editar cadastro da pessoa"
          accessibilityState={{ disabled: !onEditar }}
          style={({ pressed }) => [
            styles.editButton,
            (!onEditar || pressed) && styles.dimmed,
          ]}
        >
          <Pencil size={18} color={colors.primary} />
          <Text style={styles.editText}>Editar cadastro</Text>
        </Pressable>
        {!onEditar && (
          <Text style={styles.actionHelp}>Edição indisponível no momento.</Text>
        )}
        {onInformarSituacao && (
          <Pressable
            onPress={onInformarSituacao}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.informarButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.informarButtonText}>Informar situação</Text>
          </Pressable>
        )}
        <Secao titulo="Situação informada">
          <View
            style={[styles.statusBadge, { backgroundColor: fundoSituacao }]}
          >
            <Text style={[styles.statusText, { color: corSituacao }]}>
              {situacao?.status ?? "Não disponível"}
            </Text>
          </View>
          {situacao ? (
            <>
              <Informacao
                titulo="Última resposta"
                valor={formatarMomento(situacao.dataResposta)}
              />
              {situacao.observacao?.trim() && (
                <Informacao
                  titulo="Observação da resposta"
                  valor={situacao.observacao}
                />
              )}
              <Text style={styles.helper}>
                Esta é a última situação registrada. A condição da pessoa pode
                ter mudado desde essa resposta.
              </Text>
            </>
          ) : (
            <Text style={styles.body}>
              A situação da pessoa não está disponível nesta consulta.
            </Text>
          )}
        </Secao>
        <Secao titulo="Informações básicas">
          <Informacao titulo="Nome" valor={pessoa.nome} />
          <Informacao titulo="Data de nascimento" valor={nascimento?.data} />
          <Informacao titulo="Seu vínculo" valor={pessoa.vinculo} />
          {!demonstracao && (
  <View style={{ gap: 8 }}>
    <Text style={styles.helper}>
      Código para solicitar vínculo
    </Text>

    <Text selectable style={styles.body}>
      {pessoa.id}
    </Text>

    <Text style={styles.helper}>
      Compartilhe este código com quem deseja acompanhar
      esta pessoa. O acesso depende da aprovação do pedido.
    </Text>
  </View>
)}
        </Secao>
        <Secao titulo="Necessidades de apoio">
          <Etiquetas
            itens={pessoa.necessidades}
            vazio="Nenhuma necessidade de apoio informada."
          />
        </Secao>
        <Secao titulo="Recursos para deslocamento">
          <Etiquetas
            itens={pessoa.recursos}
            vazio="Nenhum recurso para deslocamento informado."
          />
        </Secao>
        <Secao titulo="Observações">
          <Text style={styles.body}>
            {pessoa.observacoes?.trim() || "Nenhuma observação informada."}
          </Text>
        </Secao>
        <Text style={styles.sectionHeading}>Endereços cadastrados</Text>
        {onGerenciarEnderecos && (
          <View style={styles.unlinkArea}>
            <Botao
              texto="Gerenciar endereços"
              secundario
              onPress={onGerenciarEnderecos}
            />
          </View>
        )}
        {pessoa.enderecos.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.body}>
              Nenhum endereço foi disponibilizado.
            </Text>
          </View>
        ) : (
          pessoa.enderecos.map((endereco, indice) => {
            const cidadeUf = [endereco.cidade, endereco.uf]
              .filter(Boolean)
              .join(" - ");
            const linhasEndereco = [
              [endereco.logradouro, endereco.numero].filter(Boolean).join(", "),
              endereco.complemento,
              endereco.bairro,
              endereco.distrito ? `Distrito: ${endereco.distrito}` : null,
              cidadeUf,
              endereco.cep ? `CEP: ${endereco.cep}` : null,
            ]
              .filter(Boolean)
              .join("\n");
            const presenca =
              endereco.presencaInformada === true
                ? "Presença informada neste endereço."
                : endereco.presencaInformada === false
                  ? "Foi informado que a pessoa não está neste endereço."
                  : "Presença neste endereço não informada.";
            return (
              <View key={endereco.id} style={styles.card}>
                <View style={styles.addressHeader}>
                  <MapPin size={21} color={colors.primary} />
                  <Text style={styles.addressTitle}>
                    {endereco.nomeLocal || `Endereço ${indice + 1}`}
                  </Text>
                </View>
                {endereco.indicadoComoAtual && (
                  <Text style={styles.addressTag}>
                    Indicado como atual no cadastro
                  </Text>
                )}
                <Text style={styles.body}>
                  {linhasEndereco || "Dados do endereço não informados."}
                </Text>
                {endereco.pontoReferencia && (
                  <Informacao
                    titulo="Ponto de referência"
                    valor={endereco.pontoReferencia}
                  />
                )}
                {endereco.tipoImovel && (
                  <Informacao
                    titulo="Tipo de imóvel"
                    valor={endereco.tipoImovel}
                  />
                )}
                {endereco.andar != null && (
                  <Informacao titulo="Andar" valor={String(endereco.andar)} />
                )}
                <View style={styles.presenceBox}>
                  <Text style={styles.body}>{presenca}</Text>
                  {endereco.presencaInformadaEm && (
                    <Text style={styles.helper}>
                      Informado em{" "}
                      {formatarMomento(endereco.presencaInformadaEm)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
        {onVerVinculos && (
          <View style={styles.unlinkArea}>
            <Pressable
              onPress={onVerVinculos}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.unlinkButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.unlinkText}>
                Pessoas com acesso ao cadastro
              </Text>
            </Pressable>
          </View>
        )}
        {onPararAcompanhamento && (
          <View style={styles.unlinkArea}>
            <Pressable
              onPress={onPararAcompanhamento}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.unlinkButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.unlinkText}>Parar de acompanhar</Text>
            </Pressable>
            <Text style={styles.unlinkDescription}>
              Remove somente seu vínculo com este cadastro.
            </Text>
          </View>
        )}
        <Aviso texto="O endereço cadastrado e a presença informada não confirmam que a pessoa está em segurança." />
        {onAbrirExclusao && (
          <Pressable
            onPress={onAbrirExclusao}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.deleteEntry,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.deleteEntryText}>Excluir cadastro</Text>
          </Pressable>
        )}
        <Botao texto="Voltar para pessoas" secundario onPress={onVoltar} />
      </ScrollView>
    </SafeAreaView>
  );
}
function AvatarPessoa({
  nome,
  fotoUrl,
}: Pick<PessoaDetalhes, "nome" | "fotoUrl">) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [fotoFalhou, setFotoFalhou] = useState(false);
  return (
    <View style={styles.avatar}>
      {fotoUrl && !fotoFalhou ? (
        <Image
          source={{ uri: fotoUrl }}
          style={styles.photo}
          accessibilityLabel={`Foto de ${nome}`}
          onError={() => setFotoFalhou(true)}
        />
      ) : (
        <Text style={styles.initials}>{obterIniciais(nome)}</Text>
      )}
    </View>
  );
}
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {children}
    </View>
  );
}
function Informacao({
  titulo,
  valor,
}: {
  titulo: string;
  valor?: string | null;
}) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View style={styles.information}>
      <Text style={styles.label}>{titulo}</Text>
      <Text style={styles.body}>{valor?.trim() || "Não informado"}</Text>
    </View>
  );
}
function Etiquetas({ itens, vazio }: { itens: string[]; vazio: string }) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  if (itens.length === 0) {
    return <Text style={styles.body}>{vazio}</Text>;
  }
  return (
    <View style={styles.tags}>
      {itens.map((item, indice) => (
        <View key={`${indice}-${item}`} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
function Aviso({ texto }: { texto: string }) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View style={styles.notice}>
      <Info size={19} color={colors.infoText} />
      <Text style={styles.noticeText}>{texto}</Text>
    </View>
  );
}
function Botao({
  texto,
  onPress,
  secundario = false,
}: {
  texto: string;
  onPress: () => void;
  secundario?: boolean;
}) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        secundario && styles.secondaryButton,
        pressed && styles.dimmed,
      ]}
    >
      <Text
        style={[styles.buttonText, secundario && styles.secondaryButtonText]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}
const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  profile: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 4,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  initials: {
    fontSize: 30,
    fontWeight: "600",
    color: colors.primary,
  },
  name: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  profileDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSecondary,
  },
  editButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  editText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  actionHelp: {
    fontSize: 13,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 20,
  },
  card: {
    gap: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  information: {
    gap: 5,
  },
  label: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  tagText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  addressTag: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary,
  },
  presenceBox: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
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
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: colors.onPrimary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  dimmed: {
    opacity: 0.6,
  },
  emptyCard: {
    padding: 24,
    gap: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: colors.textSecondary,
  },
  deleteEntry: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteEntryText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  informarButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  informarButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  unlinkArea: {
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  unlinkButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unlinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  unlinkDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
}));
