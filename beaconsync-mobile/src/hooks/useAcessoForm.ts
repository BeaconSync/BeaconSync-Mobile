import { useRef, useState } from "react";

import type {
  CredenciaisLogin,
  DadosCadastroUsuario,
  PapelCadastro,
} from "../types/acesso";

export type {
  CredenciaisLogin,
  DadosCadastroUsuario,
} from "../types/acesso";

export type AcoesAcesso = {
  onLogin?: (
    dados: CredenciaisLogin,
  ) => Promise<void>;

  onCadastro?: (
    dados: DadosCadastroUsuario,
  ) => Promise<void>;
};

type ConfiguracaoAcesso = AcoesAcesso & {
  modo: "login" | "cadastro";
};

type CamposAcesso = {
  nome: string;
  email: string;
  telefone: string;
  papel: PapelCadastro | "";
  senha: string;
  confirmacaoSenha: string;
};

type ErrosAcesso = Partial<
  Record<keyof CamposAcesso, string>
>;

export function useAcessoForm({
  modo,
  onLogin,
  onCadastro,
}: ConfiguracaoAcesso) {
  const [dados, setDados] =
    useState<CamposAcesso>({
      nome: "",
      email: "",
      telefone: "",
      papel: "",
      senha: "",
      confirmacaoSenha: "",
    });

  const [erros, setErros] =
    useState<ErrosAcesso>({});

  const [mensagem, setMensagem] =
    useState<string | null>(null);

  const [enviando, setEnviando] =
    useState(false);

  const envioEmAndamento = useRef(false);

  function alterarCampo<
    K extends keyof CamposAcesso,
  >(
    campo: K,
    valor: CamposAcesso[K],
  ) {
    setDados((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErros((atual) => ({
      ...atual,
      [campo]: undefined,

      ...(campo === "senha"
        ? { confirmacaoSenha: undefined }
        : {}),
    }));

    setMensagem(null);
  }

  function validar() {
    const novosErros: ErrosAcesso = {};

    const email = dados.email.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      ) ||
      email.length > 160
    ) {
      novosErros.email =
        "Informe um e-mail válido com até 160 caracteres.";
    }

    if (!dados.senha.trim()) {
      novosErros.senha =
        "Informe sua senha.";
    }

    if (modo === "cadastro") {
      const nome = dados.nome.trim();

      if (
        nome.length < 2 ||
        nome.length > 120
      ) {
        novosErros.nome =
          "Informe seu nome com 2 a 120 caracteres.";
      }

      const telefone =
        dados.telefone.replace(/\D/g, "");

      if (!/^\d{10,11}$/.test(telefone)) {
        novosErros.telefone =
          "Informe telefone com DDD, com 10 ou 11 números.";
      }

      if (
        dados.papel !== "RESPONSAVEL" &&
        dados.papel !== "VOLUNTARIO"
      ) {
        novosErros.papel =
          "Selecione como deseja participar.";
      }

      if (
        dados.senha.length < 8 ||
        dados.senha.length > 72 ||
        !/[a-zA-Z]/.test(dados.senha) ||
        !/\d/.test(dados.senha)
      ) {
        novosErros.senha =
          "Use de 8 a 72 caracteres, com letras e números.";
      }

      if (!dados.confirmacaoSenha) {
        novosErros.confirmacaoSenha =
          "Confirme sua senha.";
      } else if (
        dados.confirmacaoSenha !==
        dados.senha
      ) {
        novosErros.confirmacaoSenha =
          "As senhas não coincidem.";
      }
    }

    setErros(novosErros);

    return (
      Object.keys(novosErros).length === 0
    );
  }

  async function enviar() {
    if (envioEmAndamento.current) {
      return false;
    }

    setMensagem(null);

    if (!validar()) return false;

    if (
      (modo === "login" && !onLogin) ||
      (modo === "cadastro" && !onCadastro)
    ) {
      setMensagem(
        modo === "login"
          ? "O acesso está indisponível no momento."
          : "O cadastro está indisponível no momento. Nenhuma conta foi criada.",
      );

      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      const credenciais: CredenciaisLogin = {
        email: dados.email.trim(),
        senha: dados.senha,
      };

      if (modo === "login") {
        if (!onLogin) return false;

        await onLogin(credenciais);
      } else {
        const papel = dados.papel;

        if (
          !onCadastro ||
          (
            papel !== "RESPONSAVEL" &&
            papel !== "VOLUNTARIO"
          )
        ) {
          return false;
        }

        await onCadastro({
          ...credenciais,

          nome: dados.nome.trim(),

          telefone: dados.telefone.replace(
            /\D/g,
            "",
          ),

          papel,
        });
      }

      setDados((atual) => ({
        ...atual,
        senha: "",
        confirmacaoSenha: "",
      }));

      return true;
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir a solicitação. Tente novamente.",
      );

      return false;
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    dados,
    erros,
    mensagem,
    enviando,
    alterarCampo,
    enviar,
  };
}