import type {
  DadosPerfil,
} from "../types/perfil";

import {
  especialidadesVoluntario,
  type DadosCadastroVoluntario,
  type Voluntario,
} from "../types/voluntario";

import { api } from "./api";
import { ErroApi } from "./http";

type VoluntarioApi = {
  id: number;
  telefone: string;
  cidade: string | null;
  uf: string | null;
  especialidade: string;
  outraEspecialidade: string | null;
  disponivelParaAjuda: boolean;
  observacoes: string | null;
  atualizadoEm: string | null;
};

const ROTA = "/api/v1/voluntarios/me";

function adaptar(
  valor: VoluntarioApi,
): Voluntario {
  const especialidade =
    especialidadesVoluntario.find(
      (item) =>
        item === valor?.especialidade,
    );

  if (
    !valor ||
    !Number.isSafeInteger(valor.id) ||
    valor.id <= 0 ||
    typeof valor.telefone !== "string" ||
    typeof valor.disponivelParaAjuda !==
      "boolean"
  ) {
    throw new Error(
      "Não foi possível interpretar seu cadastro de voluntariado.",
    );
  }

  if (!especialidade) {
    throw new Error(
      "A especialidade cadastrada na API ainda não é reconhecida pelo aplicativo.",
    );
  }

  return {
    id: String(valor.id),
    telefone: valor.telefone,
    cidade: valor.cidade ?? "",
    uf: valor.uf ?? "",
    especialidade,

    outraEspecialidade:
      valor.outraEspecialidade ?? "",

    disponivel:
      valor.disponivelParaAjuda,

    observacoes:
      valor.observacoes ?? "",

    atualizadoEm:
      valor.atualizadoEm ?? null,
  };
}

function montarDados(
  perfil: DadosPerfil,
  dados: DadosCadastroVoluntario,
) {
  if (perfil.email.trim().length > 150) {
    throw new Error(
      "Seu e-mail ultrapassa o limite aceito para o cadastro de voluntariado.",
    );
  }

  return {
    nome: perfil.nome.trim(),
    email: perfil.email.trim(),

    telefone: dados.telefone.replace(
      /\D/g,
      "",
    ),

    cidade: dados.cidade.trim(),
    uf: dados.uf.trim().toUpperCase(),
    especialidade: dados.especialidade,

    outraEspecialidade:
      dados.especialidade === "Outro"
        ? dados.outraEspecialidade.trim() ||
          null
        : null,

    observacoes:
      dados.observacoes.trim() || null,

    disponivelParaAjuda:
      dados.disponivel,
  };
}

export async function consultarMeuVoluntariado():
  Promise<Voluntario | null> {
  try {
    const resposta =
      await api<VoluntarioApi>(
        "net",
        ROTA,
      );

    return adaptar(resposta);
  } catch (erro) {
    if (
      erro instanceof ErroApi &&
      erro.status === 404
    ) {
      return null;
    }

    throw erro;
  }
}

export async function cadastrarMeuVoluntariado(
  perfil: DadosPerfil,
  dados: DadosCadastroVoluntario,
): Promise<Voluntario> {
  const resposta =
    await api<VoluntarioApi>(
      "net",
      ROTA,
      {
        metodo: "POST",
        dados: montarDados(perfil, dados),
      },
    );

  return adaptar(resposta);
}

export async function salvarMeuVoluntariado(
  perfil: DadosPerfil,
  dados: DadosCadastroVoluntario,
): Promise<Voluntario> {
  const resposta =
    await api<VoluntarioApi>(
      "net",
      ROTA,
      {
        metodo: "PUT",
        dados: montarDados(perfil, dados),
      },
    );

  return adaptar(resposta);
}

export async function atualizarMinhaDisponibilidade(
  disponivel: boolean,
): Promise<Voluntario> {
  const resposta =
    await api<VoluntarioApi>(
      "net",
      `${ROTA}/disponibilidade`,
      {
        metodo: "PATCH",

        dados: {
          disponivelParaAjuda:
            disponivel,
        },
      },
    );

  return adaptar(resposta);
}