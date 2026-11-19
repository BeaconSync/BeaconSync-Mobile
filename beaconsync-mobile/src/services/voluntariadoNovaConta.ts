import type {
  DadosCadastroUsuario,
} from "../types/acesso";

import {
  especialidadesVoluntario,
  type DadosCadastroVoluntario,
} from "../types/voluntario";

import { http } from "./http";

export function validarVoluntariadoNovaConta(
  conta: DadosCadastroUsuario,
  dados: DadosCadastroVoluntario,
) {
  if (conta.email.trim().length > 150) {
    throw new Error(
      "Para o voluntariado, use um e-mail com até 150 caracteres.",
    );
  }

  if (
    dados.cidade.trim().length < 2 ||
    dados.cidade.trim().length > 100
  ) {
    throw new Error(
      "Informe a cidade de atuação com 2 a 100 caracteres.",
    );
  }

  const uf = dados.uf.trim().toUpperCase();

  if (
    !/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(
      uf,
    )
  ) {
    throw new Error("Informe uma UF válida, como SP.");
  }

  if (
    !especialidadesVoluntario.some(
      (item) => item === dados.especialidade,
    )
  ) {
    throw new Error(
      "Selecione sua área de atuação no voluntariado.",
    );
  }

  if (
    dados.especialidade === "Outro" &&
    !dados.outraEspecialidade.trim()
  ) {
    throw new Error(
      "Descreva como você deseja ajudar.",
    );
  }

  if (dados.outraEspecialidade.trim().length > 200) {
    throw new Error(
      "Descreva a especialidade com até 200 caracteres.",
    );
  }

  if (dados.observacoes.trim().length > 1000) {
    throw new Error(
      "Use até 1000 caracteres nas observações.",
    );
  }
}

function objeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

// Chame somente depois de confirmar a criação da conta Java.
// Retorna um aviso se alguma etapa posterior falhar.
export async function cadastrarVoluntariadoNovaConta(
  conta: DadosCadastroUsuario,
  dados: DadosCadastroVoluntario,
): Promise<string | null> {
  let refreshToken: string | null = null;
  let aviso: string | null = null;

  try {
    const login = await http<unknown>(
      "java",
      "/api/v1/auth/login",
      {
        metodo: "POST",
        dados: {
          email: conta.email,
          senha: conta.senha,
        },
      },
    );

    if (
      objeto(login) &&
      typeof login.refreshToken === "string"
    ) {
      refreshToken = login.refreshToken;
    }

    if (
      !objeto(login) ||
      typeof login.token !== "string" ||
      !login.token.trim() ||
      !refreshToken?.trim()
    ) {
      throw new Error(
        "Não foi possível autenticar o cadastro de voluntariado.",
      );
    }

    const resposta = await http<unknown>(
      "net",
      "/api/v1/voluntarios/me",
      {
        metodo: "POST",
        dados: {
          nome: conta.nome.trim(),
          email: conta.email.trim(),
          telefone: conta.telefone.replace(/\D/g, ""),
          cidade: dados.cidade.trim(),
          uf: dados.uf.trim().toUpperCase(),
          especialidade: dados.especialidade,
          outraEspecialidade:
            dados.especialidade === "Outro"
              ? dados.outraEspecialidade.trim()
              : null,
          observacoes:
            dados.observacoes.trim() || null,
          disponivelParaAjuda: dados.disponivel,
        },
      },
      login.token,
    );

    if (
      !objeto(resposta) ||
      typeof resposta.id !== "number" ||
      !Number.isSafeInteger(resposta.id) ||
      resposta.id <= 0
    ) {
      throw new Error(
        "O .NET não retornou a confirmação esperada.",
      );
    }
  } catch {
    aviso =
      "Sua conta foi criada no Java, mas não foi possível confirmar o cadastro de voluntariado no .NET. Entre e acesse Perfil → Meu voluntariado para conferir e completar o cadastro. Não crie outra conta.";
  } finally {
    if (refreshToken) {
      try {
        await http<void>(
          "java",
          "/api/v1/auth/logout",
          {
            metodo: "POST",
            dados: { refreshToken },
          },
        );
      } catch {
        aviso ??=
          "Sua conta e seu voluntariado foram salvos. Não foi possível confirmar o encerramento da sessão temporária. Você pode entrar normalmente.";
      }
    }
  }

  return aviso;
}