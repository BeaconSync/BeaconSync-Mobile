import type {
  DadosCadastroUsuario,
} from "../types/acesso";

import { http } from "./http";

export async function cadastrarUsuario(
  dados: DadosCadastroUsuario,
): Promise<void> {
  await http<unknown>(
    "java",
    "/api/v1/auth/registro",
    {
      metodo: "POST",

      dados: {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        senha: dados.senha,

        telefone: dados.telefone.replace(
          /\D/g,
          "",
        ),

        papel: dados.papel,
      },
    },
  );
}