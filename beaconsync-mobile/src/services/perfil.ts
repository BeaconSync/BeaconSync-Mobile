import type { DadosPerfil } from "../types/perfil";

import { api } from "./api";
import { consultarFotoPerfil } from "./fotoPerfil";
import { versaoSessao } from "./sessao";

export function converterUsuarioApi(
  valor: unknown
): {
  perfil: DadosPerfil;
  temFoto: boolean;
} {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    throw new Error(
      "A API retornou um perfil inválido."
    );
  }

  const usuario = valor as Record<string, unknown>;

  const idValido =
    typeof usuario.id === "number"
      ? Number.isSafeInteger(usuario.id) &&
        usuario.id > 0
      : typeof usuario.id === "string" &&
        /^[1-9]\d*$/.test(usuario.id);

  if (
    !idValido ||
    typeof usuario.nome !== "string" ||
    !usuario.nome.trim() ||
    typeof usuario.email !== "string" ||
    !(
      usuario.telefone == null ||
      typeof usuario.telefone === "string"
    ) ||
    !(
      usuario.papel === undefined ||
      typeof usuario.papel === "string"
    ) ||
    !(
      usuario.fotoUrl == null ||
      typeof usuario.fotoUrl === "string"
    )
  ) {
    throw new Error(
      "A API retornou dados de perfil em um formato inesperado."
    );
  }

  return {
    perfil: {
      id: String(usuario.id),
      nome: usuario.nome,
      email: usuario.email,

      telefone:
        typeof usuario.telefone === "string"
          ? usuario.telefone
          : null,

      papel:
        typeof usuario.papel === "string"
          ? usuario.papel
          : undefined,

      fotoUrl: null,
    },

    temFoto:
      typeof usuario.fotoUrl === "string" &&
      Boolean(usuario.fotoUrl.trim()),
  };
}

export async function consultarMeuPerfil():
  Promise<DadosPerfil> {
  const versao = versaoSessao();

  const resposta = await api<unknown>(
    "java",
    "/api/v1/usuarios/me"
  );

  const { perfil, temFoto } =
    converterUsuarioApi(resposta);

  if (versao !== versaoSessao()) {
    throw new Error("A sessão foi alterada.");
  }

  const fotoUrl = temFoto
    ? await consultarFotoPerfil()
    : null;

  if (versao !== versaoSessao()) {
    throw new Error("A sessão foi alterada.");
  }

  return {
    ...perfil,
    fotoUrl,
  };
}