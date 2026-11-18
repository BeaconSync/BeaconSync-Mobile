import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { ErroApi, http, urlApi } from "./http";

type Tokens = {
  token: string;
  refreshToken: string;
  expiraEm: number;
  origemJava: string;
};

type RespostaLogin = {
  token: string;
  refreshToken: string;
  expiraEmSegundos: number;
};

const CHAVE = "beaconsync.sessao.v1";

let tokens: Tokens | null = null;

let geracao = 0;

let gravacao: Promise<void> = Promise.resolve();

let renovacao: Promise<string> | null = null;

let inicializacao: Promise<void> | null = null;

let entrando = false;

let estado = {
  pronto: false,
  autenticado: false,
  demonstracao: false,
  erro: null as string | null,
};

const ouvintes = new Set<() => void>();

export const obterEstadoSessao = () => estado;

export function observarSessao(
  ouvinte: () => void,
) {
  ouvintes.add(ouvinte);

  return () => {
    ouvintes.delete(ouvinte);
  };
}

function publicar(
  alteracao: Partial<typeof estado>,
) {
  estado = {
    ...estado,
    ...alteracao,
  };

  ouvintes.forEach((ouvinte) => ouvinte());
}

async function guardar(
  novos: Tokens | null,
  versao: number,
) {
  const tarefa = gravacao.then(async () => {
    if (
      versao !== geracao ||
      Platform.OS === "web"
    ) {
      return;
    }

    if (novos) {
      await SecureStore.setItemAsync(
        CHAVE,
        JSON.stringify(novos),
      );
    } else {
      await SecureStore.deleteItemAsync(CHAVE);
    }
  });

  gravacao = tarefa.catch(() => {});

  await tarefa;

  if (versao !== geracao) {
    throw new Error(
      "A sessão foi alterada. Entre novamente.",
    );
  }
}

function converter(
  resposta: RespostaLogin,
): Tokens {
  if (
    typeof resposta?.token !== "string" ||
    !resposta.token ||
    typeof resposta.refreshToken !== "string" ||
    !resposta.refreshToken ||
    !Number.isFinite(resposta.expiraEmSegundos) ||
    resposta.expiraEmSegundos <= 0
  ) {
    throw new Error(
      "O Java não retornou os tokens esperados.",
    );
  }

  return {
    token: resposta.token,
    refreshToken: resposta.refreshToken,

    expiraEm:
      Date.now() +
      resposta.expiraEmSegundos * 1000,

    origemJava: urlApi("java"),
  };
}

export function iniciarSessao(): Promise<void> {
  if (inicializacao) return inicializacao;

  if (estado.pronto && !estado.erro) {
    return Promise.resolve();
  }

  publicar({
    pronto: false,
    erro: null,
  });

  const versao = geracao;

  inicializacao = (async () => {
    try {
      const salvo =
        Platform.OS === "web"
          ? null
          : await SecureStore.getItemAsync(CHAVE);

      const valor = salvo
        ? JSON.parse(salvo)
        : null;

      if (versao !== geracao) return;

      if (
        valor &&
        typeof valor.token === "string" &&
        typeof valor.refreshToken === "string" &&
        Number.isFinite(valor.expiraEm) &&
        valor.origemJava === urlApi("java")
      ) {
        tokens = valor;
      }

      publicar({
        autenticado: Boolean(tokens),
      });
    } catch {
      publicar({
        erro:
          "Não foi possível recuperar a sessão. Confira o .env e tente novamente.",
      });
    } finally {
      publicar({
        pronto: true,
      });

      inicializacao = null;
    }
  })();

  return inicializacao;
}

export async function entrar(dados: {
  email: string;
  senha: string;
}) {
  if (entrando) {
    throw new Error(
      "O login já está em andamento.",
    );
  }

  entrando = true;

  const versao = ++geracao;

  try {
    const resposta = await http<RespostaLogin>(
      "java",
      "/api/v1/auth/login",
      {
        metodo: "POST",
        dados,
      },
    );

    const novos = converter(resposta);

    await guardar(novos, versao);

    tokens = novos;

    publicar({
      pronto: true,
      autenticado: true,
      demonstracao: false,
      erro: null,
    });
  } finally {
    entrando = false;
  }
}

export function entrarDemonstracao() {
  if (!__DEV__ || tokens) return;

  publicar({
    pronto: true,
    demonstracao: true,
    erro: null,
  });
}

export async function renovarTokenAposTrocaPerfil(): Promise<string> {
  const versao = versaoSessao();
  const pendente = renovacao;

  if (pendente) {
    await pendente;
  }

  if (versaoSessao() !== versao) {
    throw new Error("A sessão mudou. Entre novamente.");
  }

  return renovarToken();
}

async function limparSessao() {
  const versao = ++geracao;
  const anterior = tokens;

  tokens = null;

  try {
    await guardar(null, versao);
  } catch (erro) {
    if (versao === geracao) {
      tokens = anterior;
    }

    throw erro;
  }

  publicar({
    autenticado: false,
    demonstracao: false,
  });
}

export async function sair(): Promise<
  string | null
> {
  const anterior = tokens;

  await limparSessao();

  if (!anterior) return null;

  try {
    await http<void>(
      "java",
      "/api/v1/auth/logout",
      {
        metodo: "POST",

        dados: {
          refreshToken: anterior.refreshToken,
        },
      },
    );

    return null;
  } catch {
    return (
      "Você saiu deste aparelho, mas não foi possível " +
      "confirmar o encerramento da sessão no servidor."
    );
  }
}

export function renovarToken(): Promise<string> {
  if (renovacao) return renovacao;

  const anterior = tokens;

  if (!anterior) {
    return Promise.reject(
      new Error(
        "Entre na sua conta para continuar.",
      ),
    );
  }

  const versao = geracao;

  const tarefa = (async () => {
    try {
      const resposta = await http<RespostaLogin>(
        "java",
        "/api/v1/auth/refresh",
        {
          metodo: "POST",

          dados: {
            refreshToken: anterior.refreshToken,
          },
        },
      );

      const novos = converter(resposta);

      await guardar(novos, versao);

      tokens = novos;

      return novos.token;
    } catch (erro) {
      if (
        versao === geracao &&
        erro instanceof ErroApi &&
        erro.status === 401
      ) {
        await limparSessao();

        throw new Error(
          "Sua sessão expirou. Entre novamente.",
        );
      }

      throw erro;
    }
  })();

  renovacao = tarefa;

  void tarefa
    .finally(() => {
      if (renovacao === tarefa) {
        renovacao = null;
      }
    })
    .catch(() => {});

  return tarefa;
}

export async function obterToken() {
  if (!tokens) {
    throw new Error(
      "Entre na sua conta para consultar dados reais.",
    );
  }

  if (
    tokens.expiraEm <= Date.now() + 30000
  ) {
    return renovarToken();
  }

  return tokens.token;
}

export function tokenAtual() {
  return tokens?.token;
}

export function versaoSessao() {
  return geracao;
}