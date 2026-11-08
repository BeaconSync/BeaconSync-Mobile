import { useRef, useState } from "react";

export type CredenciaisLogin = {
  email: string;
  senha: string;
};

export type DadosCadastroUsuario = CredenciaisLogin & {
  nome: string;
};

export type AcoesAcesso = {
  onLogin?: (dados: CredenciaisLogin) => Promise<void>;
  onCadastro?: (dados: DadosCadastroUsuario) => Promise<void>;
};

type ConfiguracaoAcesso = AcoesAcesso & {
  modo: "login" | "cadastro";
};

type CamposAcesso = {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
};

type ErrosAcesso = Partial<Record<keyof CamposAcesso, string>>;

export function useAcessoForm({
  modo,
  onLogin,
  onCadastro,
}: ConfiguracaoAcesso) {
  const [dados, setDados] = useState<CamposAcesso>({
    nome: "",
    email: "",
    senha: "",
    confirmacaoSenha: "",
  });

  const [erros, setErros] = useState<ErrosAcesso>({});
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const envioEmAndamento = useRef(false);

  function alterarCampo(campo: keyof CamposAcesso, valor: string) {
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!dados.senha.trim()) {
      novosErros.senha = "Informe sua senha.";
    }

    if (modo === "cadastro") {
      if (dados.nome.trim().length < 2) {
        novosErros.nome = "Informe seu nome.";
      }

      if (
        dados.senha.length < 8 ||
        !/[a-zA-Z]/.test(dados.senha) ||
        !/\d/.test(dados.senha)
      ) {
        novosErros.senha =
          "Use pelo menos 8 caracteres, com letras e números.";
      }

      if (!dados.confirmacaoSenha) {
        novosErros.confirmacaoSenha = "Confirme sua senha.";
      } else if (dados.confirmacaoSenha !== dados.senha) {
        novosErros.confirmacaoSenha = "As senhas não coincidem.";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function enviar() {
    if (envioEmAndamento.current) return false;

    setMensagem(null);

    if (!validar()) return false;

    if (modo === "login" && !onLogin) {
      setMensagem(
        "O acesso está indisponível no momento. Tente novamente mais tarde."
      );
      return false;
    }

    if (modo === "cadastro" && !onCadastro) {
      setMensagem(
        "O cadastro está indisponível no momento. Nenhuma conta foi criada."
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
        if (!onCadastro) return false;

        await onCadastro({
          ...credenciais,
          nome: dados.nome.trim(),
        });
      }

      setDados((atual) => ({
        ...atual,
        senha: "",
        confirmacaoSenha: "",
      }));

      return true;
    } catch {
      setMensagem(
        modo === "login"
          ? "Não foi possível entrar. Confira seus dados e tente novamente."
          : "Não foi possível confirmar a criação da conta. Tente novamente."
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