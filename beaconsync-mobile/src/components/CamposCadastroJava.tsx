import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CampoFormulario from "./CampoFormulario";
import {
  consultarDistritos,
  type Distrito,
} from "../services/distritos";
import { colors } from "../theme/colors";
import type {
  DadosCadastroPessoa,
  ErrosCadastroPessoa,
  EtapaCadastro,
} from "../types/cadastroPessoa";
import {
  categoriasVulnerabilidade,
  formatarCpf,
} from "../utils/validarCadatroJava";

type Props = {
  etapa: EtapaCadastro;
  dados: DadosCadastroPessoa;
  erros: ErrosCadastroPessoa;
  desabilitado?: boolean;
  onAlterar: <K extends keyof DadosCadastroPessoa>(
    campo: K,
    valor: DadosCadastroPessoa[K]
  ) => void;
};

function normalizarBusca(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CamposCadastroJava({
  etapa,
  dados,
  erros,
  desabilitado = false,
  onAlterar,
}: Props) {
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erroConsulta, setErroConsulta] =
    useState<string | null>(null);

  const [tentativa, setTentativa] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (etapa !== 3) return;

    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErroConsulta(null);

      try {
        const resultado = await consultarDistritos();

        if (!ativo) return;

        setDistritos(resultado);

        if (resultado.length === 0) {
          setErroConsulta(
            "Não há distritos disponíveis para seleção."
          );
        }
      } catch (erro) {
        if (!ativo) return;

        setDistritos([]);
        setErroConsulta(
          erro instanceof Error
            ? erro.message
            : "Não foi possível consultar os distritos."
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [etapa, tentativa]);

  if (etapa === 1) {
    return (
      <CampoFormulario
        label="CPF da pessoa"
        value={dados.cpf ?? ""}
        onChangeText={(valor) =>
          onAlterar("cpf", formatarCpf(valor))
        }
        placeholder="000.000.000-00"
        keyboardType="number-pad"
        maxLength={14}
        editable={!desabilitado}
        erro={erros.cpf}
      />
    );
  }

  if (etapa === 2) {
    return (
      <View style={styles.group}>
        <Text style={styles.label}>
          Categoria principal
        </Text>

        <Text style={styles.helper}>
          Selecione a categoria que melhor representa a
          condição da pessoa. Detalhe as necessidades abaixo.
        </Text>

        {categoriasVulnerabilidade.map((categoria) => {
          const selecionada =
            dados.tipoVulnerabilidade === categoria.valor;

          return (
            <Pressable
              key={categoria.valor}
              disabled={desabilitado}
              onPress={() =>
                onAlterar(
                  "tipoVulnerabilidade",
                  categoria.valor
                )
              }
              accessibilityRole="radio"
              accessibilityState={{
                checked: selecionada,
                disabled: desabilitado,
              }}
              style={({ pressed }) => [
                styles.option,
                selecionada && styles.selected,
                (pressed || desabilitado) && styles.dimmed,
              ]}
            >
              <Text style={styles.optionText}>
                {selecionada ? "● " : "○ "}
                {categoria.titulo}
              </Text>
            </Pressable>
          );
        })}

        {erros.tipoVulnerabilidade && (
          <Text style={styles.error}>
            {erros.tipoVulnerabilidade}
          </Text>
        )}
      </View>
    );
  }

  const distritoSelecionado = distritos.find(
    (distrito) => distrito.id === dados.distritoId
  );

  const termo = normalizarBusca(busca);

  const filtrados = distritos.filter((distrito) =>
    normalizarBusca(distrito.nome).includes(termo)
  );

  return (
    <View style={styles.group}>
      <Text style={styles.label}>Distrito</Text>

      <Text style={styles.helper}>
        O catálogo atual atende aos distritos da cidade de
        São Paulo. Selecione o distrito correspondente ao
        endereço.
      </Text>

      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helper}>
            Carregando distritos...
          </Text>
        </View>
      ) : erroConsulta ? (
        <>
          <Text style={styles.error}>
            {erroConsulta}
          </Text>

          <Pressable
            onPress={() => setTentativa((atual) => atual + 1)}
            disabled={desabilitado}
            accessibilityRole="button"
            style={styles.option}
          >
            <Text style={styles.optionText}>
              Tentar novamente
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            onPress={() => setAberto((atual) => !atual)}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityState={{
              expanded: aberto,
              disabled: desabilitado,
            }}
            style={styles.option}
          >
            <Text style={styles.optionText}>
              {distritoSelecionado?.nome ??
                "Selecionar distrito"}
              {aberto ? " ▴" : " ▾"}
            </Text>
          </Pressable>

          {aberto && (
            <>
              <CampoFormulario
                label="Buscar distrito"
                value={busca}
                onChangeText={setBusca}
                placeholder="Digite o nome do distrito"
                editable={!desabilitado}
              />

              {filtrados.length === 0 && (
                <Text style={styles.helper}>
                  Nenhum distrito encontrado.
                </Text>
              )}

              {filtrados.map((distrito) => {
                const selecionado =
                  dados.distritoId === distrito.id;

                return (
                  <Pressable
                    key={distrito.id}
                    disabled={desabilitado}
                    onPress={() => {
                      onAlterar("distritoId", distrito.id);
                      setAberto(false);
                      setBusca("");
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selecionado,
                      disabled: desabilitado,
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selecionado && styles.selected,
                      (pressed || desabilitado) &&
                        styles.dimmed,
                    ]}
                  >
                    <Text style={styles.optionText}>
                      {selecionado ? "● " : "○ "}
                      {distrito.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </>
          )}
        </>
      )}

      {erros.distritoId && (
        <Text style={styles.error}>
          {erros.distritoId}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 10,
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  option: {
    minHeight: 50,
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  error: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.warningText,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  dimmed: {
    opacity: 0.6,
  },
});