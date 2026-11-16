import type {
  DadosPerfil,
} from "../types/perfil";

import { api } from "./api";

type UsuarioApi = {
  id: number | string;
  nome: string;
  email: string;
  telefone?: string | null;
  papel?: string;
};

export async function consultarMeuPerfil():
  Promise<DadosPerfil> {
  const usuario = await api<UsuarioApi>(
    "java",
    "/api/v1/usuarios/me",
  );

  const idValido =
    usuario &&
    (
      (
        typeof usuario.id === "string" &&
        usuario.id.trim().length > 0
      ) ||
      (
        typeof usuario.id === "number" &&
        Number.isSafeInteger(usuario.id)
      )
    );

  if (
    !idValido ||
    typeof usuario.nome !== "string" ||
    typeof usuario.email !== "string"
  ) {
    throw new Error(
      "A API retornou dados de perfil em um formato inesperado.",
    );
  }

  return {
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
    
  };
}