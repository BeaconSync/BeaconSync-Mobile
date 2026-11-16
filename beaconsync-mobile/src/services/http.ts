const urls = {
  java: process.env.EXPO_PUBLIC_JAVA_API_URL,
  net: process.env.EXPO_PUBLIC_NET_API_URL,
};

export type Servico = keyof typeof urls;

export type OpcoesHttp = {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  dados?: unknown;
};

export class ErroApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

export function urlApi(servico: Servico) {
  const url = urls[servico]?.trim().replace(/\/+$/, "");

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      `Configure a URL da API ${servico} no arquivo .env.`,
    );
  }

  return url;
}

export async function http<T>(
  servico: Servico,
  caminho: string,
  opcoes: OpcoesHttp = {},
  token?: string,
): Promise<T> {
  if (!caminho.startsWith("/api/v1/")) {
    throw new Error("Caminho de API inválido.");
  }

  const url = `${urlApi(servico)}${caminho}`;
  const controller = new AbortController();

  const limite = setTimeout(
    () => controller.abort(),
    20000,
  );

  try {
    const resposta = await fetch(url, {
      method: opcoes.metodo ?? "GET",
      signal: controller.signal,

      headers: {
        Accept: "application/json",

        ...(opcoes.dados !== undefined
          ? { "Content-Type": "application/json" }
          : {}),

        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },

      body:
        opcoes.dados === undefined
          ? undefined
          : JSON.stringify(opcoes.dados),
    });

    const texto = await resposta.text();

    let corpo: any = null;

    try {
      corpo = texto ? JSON.parse(texto) : null;
    } catch {
      // Uma resposta de erro pode não conter JSON.
    }

    if (!resposta.ok) {
      const mensagem = [
        corpo?.mensagem,
        corpo?.detail,
        corpo?.title,
      ].find(
        (valor) =>
          typeof valor === "string" && valor.trim(),
      );

      throw new ErroApi(
        resposta.status,
        mensagem ||
          (resposta.status === 401
            ? "E-mail, senha ou sessão inválidos."
            : resposta.status === 403
              ? "Você não tem permissão para esta ação."
              : resposta.status === 429
                ? "Muitas tentativas. Aguarde e tente novamente."
                : `Não foi possível concluir a solicitação (${resposta.status}).`),
      );
    }

    if (
      resposta.status !== 204 &&
      texto &&
      corpo === null
    ) {
      throw new Error(
        "A API devolveu uma resposta inválida.",
      );
    }

    return corpo as T;
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;

    if (controller.signal.aborted) {
      throw new Error(
        "A API demorou para responder. Tente novamente.",
      );
    }

    if (erro instanceof TypeError) {
      throw new Error(
        "Não foi possível conectar à API. Confira a URL e sua conexão.",
      );
    }

    throw erro;
  } finally {
    clearTimeout(limite);
  }
}