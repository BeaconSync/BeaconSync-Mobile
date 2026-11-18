import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Keyboard } from "react-native";

import type {
  AlteracaoFotoPerfil,
  DadosPerfil,
  PapelEditavel,
  SalvarPerfil,
} from "../types/perfil";

function normalizarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "");

  if (
    numeros.startsWith("55") &&
    (numeros.length === 12 || numeros.length === 13)
  ) {
    return numeros.slice(2);
  }

  return numeros;
}

export function useEditarPerfil(
  perfil: DadosPerfil,
  onSalvar?: SalvarPerfil
) {
  const [nome, setNome] = useState(perfil.nome);
  const [telefone, setTelefone] = useState(
    perfil.telefone ?? ""
  );

  const podeAlterarPapel =
    perfil.papel === "RESPONSAVEL" ||
    perfil.papel === "VOLUNTARIO";

  const [papel, setPapel] = useState<PapelEditavel | null>(
    () =>
      perfil.papel === "RESPONSAVEL" ||
      perfil.papel === "VOLUNTARIO"
        ? perfil.papel
        : null
  );

  const [foto, setFoto] = useState<AlteracaoFotoPerfil>({
    acao: "manter",
  });

  const [enviando, setEnviando] = useState(false);
  const [escolhendoFoto, setEscolhendoFoto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const operacaoEmAndamento = useRef(false);

  const bloqueado = enviando || escolhendoFoto;

  const fotoPreview =
    foto.acao === "substituir"
      ? foto.uri
      : foto.acao === "remover"
        ? null
        : perfil.fotoUrl;

  function alterarNome(valor: string) {
    if (operacaoEmAndamento.current) return;

    setNome(valor);
    setErro(null);
  }

  function alterarTelefone(valor: string) {
    if (operacaoEmAndamento.current) return;

    setTelefone(valor);
    setErro(null);
  }

  function alterarPapel(valor: PapelEditavel) {
    if (
      operacaoEmAndamento.current ||
      !podeAlterarPapel
    ) {
      return;
    }

    if (
      valor !== "RESPONSAVEL" &&
      valor !== "VOLUNTARIO"
    ) {
      return;
    }

    setPapel(valor);
    setErro(null);
  }

  async function escolherFoto() {
    if (operacaoEmAndamento.current) return;

    operacaoEmAndamento.current = true;
    setEscolhendoFoto(true);
    setErro(null);
    Keyboard.dismiss();

    try {
      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (resultado.canceled) return;

      const imagem = resultado.assets[0];

      if (!imagem?.uri) {
        setErro(
          "Não foi possível carregar a foto selecionada."
        );
        return;
      }

      setFoto({
        acao: "substituir",
        uri: imagem.uri,
        nomeArquivo: imagem.fileName ?? null,
        tipoMime: imagem.mimeType ?? null,
      });
    } catch {
      setErro(
        "Não foi possível abrir ou selecionar a foto. Tente novamente."
      );
    } finally {
      operacaoEmAndamento.current = false;
      setEscolhendoFoto(false);
    }
  }

  function removerFoto() {
    if (operacaoEmAndamento.current) return;

    setFoto(
      perfil.fotoUrl
        ? { acao: "remover" }
        : { acao: "manter" }
    );

    setErro(null);
  }

  async function salvar(): Promise<DadosPerfil | null> {
    if (operacaoEmAndamento.current) return null;

    setErro(null);

    const nomeTratado = nome.trim();
    const telefoneTratado = normalizarTelefone(telefone);

    if (
      nomeTratado.length < 2 ||
      nomeTratado.length > 120
    ) {
      setErro("Informe seu nome com 2 a 120 caracteres.");
      return null;
    }

    const caracteresValidos = /^[\d\s()+-]+$/.test(
      telefone
    );

    const tamanhoValido =
      telefoneTratado.length === 10 ||
      telefoneTratado.length === 11;

    if (!caracteresValidos || !tamanhoValido) {
      setErro(
        "Informe um telefone brasileiro com DDD e 10 ou 11 números."
      );
      return null;
    }

    if (!onSalvar) {
      setErro(
        "A edição está indisponível no momento. Nenhuma alteração, incluindo a foto, foi salva."
      );
      return null;
    }

    operacaoEmAndamento.current = true;
    setEnviando(true);

    try {
      const atualizado = await onSalvar({
        nome: nomeTratado,
        telefone: telefoneTratado,
        foto,
        ...(podeAlterarPapel &&
        papel &&
        papel !== perfil.papel
          ? { papel }
          : {}),
      });

      return atualizado;
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível confirmar a atualização. Seus dados continuam preenchidos."
      );

      return null;
    } finally {
      operacaoEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    nome,
    telefone,
    papel,
    podeAlterarPapel,
    fotoPreview,
    enviando,
    escolhendoFoto,
    bloqueado,
    erro,
    alterarNome,
    alterarTelefone,
    alterarPapel,
    escolherFoto,
    removerFoto,
    salvar,
  };
}