import { Plus, Search, Users } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CardPessoa from "../components/CardPessoa";
import { useBuscaPessoas } from "../hooks/useBuscaPessoas";
import { colors } from "../theme/colors";
import type {
  EstadoPessoas,
  PessoaResumo,
} from "../types/pessoa";

type PessoasScreenProps = {
  estado?: EstadoPessoas;
  onTentarNovamente?: () => void;
  onAbrirPessoa?: (pessoa: PessoaResumo) => void;
  onCadastrar: () => void;
};



const LISTA_VAZIA: PessoaResumo[] = [];

export default function PessoasScreen({
  estado = { status: "indisponivel" },
  onTentarNovamente,
  onAbrirPessoa,
  onCadastrar,
}: PessoasScreenProps) {
  const pessoas =
    estado.status === "sucesso"
      ? estado.pessoas
      : LISTA_VAZIA;

  const { busca, setBusca, pessoasFiltradas } =
    useBuscaPessoas(pessoas);

  const podeBuscar = estado.status === "sucesso";

  let tituloMensagem = "Informações indisponíveis";
  let descricaoMensagem =
    "Ainda não foi possível consultar as pessoas acompanhadas.";

  if (estado.status === "carregando") {
    tituloMensagem = "Carregando pessoas";
    descricaoMensagem = "Aguarde enquanto buscamos as informações.";
  } else if (estado.status === "erro") {
    tituloMensagem = "Não foi possível carregar";
    descricaoMensagem = estado.mensagem;
  } else if (estado.status === "sucesso") {
    if (pessoas.length === 0) {
      tituloMensagem = "Nenhuma pessoa acompanhada";
      descricaoMensagem =
        "Você ainda não possui pessoas vinculadas à sua conta.";
    } else {
      tituloMensagem = "Nenhuma pessoa encontrada";
      descricaoMensagem =
        "Tente buscar por outro nome ou limpe a pesquisa.";
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
  <Text style={[styles.title, styles.titleText]}>
    Pessoas acompanhadas
  </Text>

  <Pressable
    onPress={onCadastrar}
    accessibilityRole="button"
    accessibilityLabel="Cadastrar pessoa"
    style={({ pressed }) => [
      styles.addButton,
      pressed && styles.pressed,
    ]}
  >
    <Plus size={24} color={colors.surface} />
  </Pressable>
</View>

          <Text style={styles.subtitle}>
            Quem você acompanha e ajuda a proteger.
          </Text>

          {estado.status === "sucesso" ? (
            <Text style={styles.counter}>
              {pessoas.length}{" "}
              {pessoas.length === 1
                ? "pessoa acompanhada"
                : "pessoas acompanhadas"}
            </Text>
          ) : null}
        </View>

        <View style={styles.searchBox}>
          <Search size={21} color={colors.textSecondary} />

          <TextInput
            style={styles.searchInput}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Buscar pessoa por nome"
            autoCorrect={false}
            returnKeyType="search"
            editable={podeBuscar}
          />
        </View>

        <FlatList
          style={styles.list}
          data={pessoasFiltradas}
          keyExtractor={(pessoa) => pessoa.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separador}
          renderItem={({ item }) => (
            <CardPessoa
              pessoa={item}
              onPress={
                onAbrirPessoa
                  ? () => onAbrirPessoa(item)
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.messageCard}>
              {estado.status === "carregando" ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
              ) : (
                <Users size={32} color={colors.primary} />
              )}

              <Text style={styles.messageTitle}>
                {tituloMensagem}
              </Text>

              <Text style={styles.messageDescription}>
                 {descricaoMensagem}
              </Text>

                {(
                estado.status === "indisponivel" ||
               (estado.status === "sucesso" && pessoas.length === 0)
                ) && (
               <Pressable
               onPress={onCadastrar}
                accessibilityRole="button"
                accessibilityLabel="Cadastrar pessoa"
                 style={({ pressed }) => [
                  styles.botaoCadastrarVazio,
                  pressed && styles.pressed,
                  ]}
                >
                <Plus size={20} color={colors.surface} />

                <Text style={styles.textoCadastrarVazio}>
                 Cadastrar pessoa
                </Text>
                </Pressable>
             )}

              {estado.status === "erro" &&
              onTentarNovamente ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onTentarNovamente}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    Tentar novamente
                  </Text>
                </Pressable>
              ) : null}

              {estado.status === "sucesso" &&
              pessoas.length > 0 &&
              busca.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setBusca("")}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearText}>
                    Limpar busca
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
  counter: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
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
  messageCard: {
    alignItems: "center",
    padding: 24,
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
  },
  messageTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  messageDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  clearButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  clearText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  titleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},
titleText: {
  flex: 1,
},
addButton: {
  width: 48,
  height: 48,
  borderRadius: 14,
  backgroundColor: colors.primary,
  alignItems: "center",
  justifyContent: "center",
},
botaoCadastrarVazio: {
  width: "100%",
  minHeight: 52,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginTop: 24,
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: colors.primary,
},

textoCadastrarVazio: {
  flexShrink: 1,
  fontSize: 15,
  fontWeight: "600",
  textAlign: "center",
  color: colors.surface,
},
});