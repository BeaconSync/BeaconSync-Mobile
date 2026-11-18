import type { CredenciaisLogin } from "../types/acesso";
import { http } from "./http";

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export async function enviarFotoNovaConta(
  credenciais: CredenciaisLogin,
  formulario: () => FormData
): Promise<string | null> {
  let refreshToken: string | null = null;
  let aviso: string | null = null;

  try {
    // Não altera a sessão do aplicativo.
    const resposta = await http<unknown>(
      "java",
      "/api/v1/auth/login",
      {
        metodo: "POST",
        dados: credenciais,
      }
    );

    if (
      objeto(resposta) &&
      typeof resposta.refreshToken === "string"
    ) {
      refreshToken = resposta.refreshToken;
    }

    if (
      !objeto(resposta) ||
      typeof resposta.token !== "string" ||
      !resposta.token.trim() ||
      !refreshToken?.trim()
    ) {
      throw new Error(
        "Não foi possível autenticar o envio da foto."
      );
    }

    await http<unknown>(
      "java",
      "/api/v1/usuarios/me/foto",
      {
        metodo: "PUT",
        formulario,
      },
      resposta.token
    );
  } catch {
    aviso =
      "Sua conta foi criada, mas não conseguimos confirmar o envio da foto. Entre na conta e confira em Perfil → Editar perfil. Não é necessário repetir o cadastro.";
  } finally {
    if (refreshToken) {
      try {
        await http<void>(
          "java",
          "/api/v1/auth/logout",
          {
            metodo: "POST",
            dados: { refreshToken },
          }
        );
      } catch {
        aviso ??=
          "Sua conta e sua foto foram salvas. Não conseguimos confirmar o encerramento da sessão temporária usada no envio. Você pode entrar normalmente.";
      }
    }
  }

  return aviso;
}