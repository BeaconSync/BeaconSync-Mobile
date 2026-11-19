const urls = {
  java: process.env.EXPO_PUBLIC_JAVA_API_URL,
  net: process.env.EXPO_PUBLIC_NET_API_URL,
};

export type Servico = keyof typeof urls;

export type OpcoesHttp = {
  timeoutMs?: number;
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  dados?: unknown;
  formulario?: () => FormData;
  retorno?: "json" | "imagem";
};

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly dados: unknown = null
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function textoPreenchido(
  valor: unknown
): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

function mensagemPadrao(status: number): string {
  switch (status) {
    case 400:
      return "Confira os dados informados.";
    case 401:
      return "Sua sessão precisa ser renovada.";
    case 403:
      return "Sua conta não tem permissão para esta operação.";
    case 404:
      return "O recurso solicitado não foi encontrado.";
    case 409:
      return "A operação conflita com um cadastro ou registro existente.";
    case 422:
      return "Não foi possível concluir a operação com os dados informados.";
    case 429:
      return "Muitas tentativas em pouco tempo. Aguarde e tente novamente.";
    default:
      return status >= 500
        ? "O serviço está indisponível no momento."
        : "Não foi possível concluir a solicitação.";
  }
}

function obterMensagemErro(
  corpo: unknown,
  status: number
): string {
  if (!objeto(corpo)) {
    return mensagemPadrao(status);
  }

  const mensagens: string[] = [];

  if (Array.isArray(corpo.campos)) {
    for (const item of corpo.campos) {
      if (objeto(item) && textoPreenchido(item.mensagem)) {
        mensagens.push(item.mensagem.trim());
      }
    }
  }

  if (objeto(corpo.errors)) {
    for (const valor of Object.values(corpo.errors)) {
      if (Array.isArray(valor)) {
        for (const mensagem of valor) {
          if (textoPreenchido(mensagem)) {
            mensagens.push(mensagem.trim());
          }
        }
      } else if (textoPreenchido(valor)) {
        mensagens.push(valor.trim());
      }
    }
  }

  if (mensagens.length > 0) {
    return [...new Set(mensagens)].join("\n");
  }

  const mensagem = [
    corpo.mensagem,
    corpo.detail,
    corpo.title,
  ].find(textoPreenchido);

  return mensagem?.trim() ?? mensagemPadrao(status);
}

export function urlApi(servico: Servico): string {
  const url = urls[servico]?.trim().replace(/\/+$/, "");

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      `Configure a URL da API ${servico} no arquivo .env.`
    );
  }

  return url;
}

async function lerImagem(
  resposta: Response,
  signal: AbortSignal
): Promise<string> {
  const tipo = resposta.headers
    .get("content-type")
    ?.split(";")[0]
    .trim();

  if (tipo !== "image/jpeg" && tipo !== "image/png") {
    throw new Error(
      "A API não devolveu uma imagem válida."
    );
  }

  const arquivo = await resposta.blob();

  if (!arquivo.size || arquivo.size > 5 * 1024 * 1024) {
    throw new Error(
      "A foto recebida está vazia ou excede o tamanho permitido."
    );
  }

  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();

    const cancelar = () => {
      leitor.abort();

      reject(
        new Error("A leitura da foto foi interrompida.")
      );
    };

    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        resolve(leitor.result);
      } else {
        reject(
          new Error("Não foi possível ler a foto recebida.")
        );
      }
    };

    leitor.onerror = () => {
      reject(
        new Error("Não foi possível ler a foto recebida.")
      );
    };

    leitor.onabort = () => {
      reject(
        new Error("A leitura da foto foi interrompida.")
      );
    };

    leitor.onloadend = () => {
      signal.removeEventListener("abort", cancelar);
    };

    if (signal.aborted) {
      cancelar();
      return;
    }

    signal.addEventListener("abort", cancelar, {
      once: true,
    });

    leitor.readAsDataURL(arquivo);
  });
}

export async function http<T>(
  servico: Servico,
  caminho: string,
  opcoes: OpcoesHttp = {},
  token?: string
): Promise<T> {
  if (!caminho.startsWith("/api/v1/")) {
    throw new Error("Caminho de API inválido.");
  }

  if (
    opcoes.formulario &&
    opcoes.dados !== undefined
  ) {
    throw new Error(
      "Envie JSON ou formulário, não os dois juntos."
    );
  }

  const url = `${urlApi(servico)}${caminho}`;
  const controller = new AbortController();

const tempoLimite = Math.min(
  120000,
  Math.max(1000, opcoes.timeoutMs ?? 20000),
);

const limite = setTimeout(
  () => controller.abort(),
  tempoLimite,
);

  try {
    const resposta = await fetch(url, {
      method: opcoes.metodo ?? "GET",
      signal: controller.signal,

      headers: {
        Accept:
          opcoes.retorno === "imagem"
            ? "image/jpeg, image/png, application/json"
            : "application/json",

        ...(opcoes.dados !== undefined
          ? { "Content-Type": "application/json" }
          : {}),

        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },

      body: opcoes.formulario
        ? opcoes.formulario()
        : opcoes.dados === undefined
          ? undefined
          : JSON.stringify(opcoes.dados),
    });

    if (
      resposta.ok &&
      opcoes.retorno === "imagem"
    ) {
      return (
        await lerImagem(resposta, controller.signal)
      ) as T;
    }

    const texto = await resposta.text();

    let corpo: unknown = null;
    let jsonValido = true;

    if (texto.trim()) {
      try {
        corpo = JSON.parse(texto);
      } catch {
        jsonValido = false;
      }
    }

    if (!resposta.ok) {
      throw new ErroApi(
        resposta.status,
        obterMensagemErro(corpo, resposta.status),
        corpo
      );
    }

    if (
      resposta.status !== 204 &&
      !jsonValido
    ) {
      throw new Error(
        "A API respondeu em um formato inesperado. Não foi possível interpretar o resultado."
      );
    }

    return corpo as T;
  } catch (erro) {
    if (erro instanceof ErroApi) {
      throw erro;
    }

    if (controller.signal.aborted) {
      throw new Error(
        "A API demorou para responder. Não foi possível confirmar o resultado da solicitação."
      );
    }

    if (erro instanceof TypeError) {
      throw new Error(
        "A conexão com a API falhou. Confira sua conexão e a URL configurada. Se estava salvando dados, verifique o resultado antes de repetir."
      );
    }

    throw erro;
  } finally {
    clearTimeout(limite);
  }
}