import {
  useEffect,
  useSyncExternalStore,
} from "react";

import {
  Platform,
  useColorScheme,
} from "react-native";

import * as SecureStore from "expo-secure-store";

import {
  darkColors,
  lightColors,
  type Cores,
} from "./colors";

export type { Cores } from "./colors";

export type PreferenciaTema =
  | "automatico"
  | "claro"
  | "escuro";

type EstadoTema = {
  preferencia: PreferenciaTema;
  pronto: boolean;
  salvando: boolean;
  erro: string | null;
};

const CHAVE = "beaconsync.tema";

let estado: EstadoTema = {
  preferencia: "automatico",
  pronto: false,
  salvando: false,
  erro: null,
};

let inicializacao: Promise<void> | null = null;

const ouvintes = new Set<() => void>();

const estadoServidor: EstadoTema = {
  preferencia: "automatico",
  pronto: false,
  salvando: false,
  erro: null,
};

function atualizar(alteracoes: Partial<EstadoTema>) {
  estado = {
    ...estado,
    ...alteracoes,
  };

  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);

  return () => {
    ouvintes.delete(ouvinte);
  };
}

function obterEstado() {
  return estado;
}

function obterEstadoServidor() {
  return estadoServidor;
}

function preferenciaValida(
  valor: unknown
): valor is PreferenciaTema {
  return (
    valor === "automatico" ||
    valor === "claro" ||
    valor === "escuro"
  );
}

async function lerPreferencia(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(CHAVE);
  }

  return SecureStore.getItemAsync(CHAVE);
}

async function gravarPreferencia(
  preferencia: PreferenciaTema
) {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      throw new Error("Armazenamento indisponível.");
    }

    window.localStorage.setItem(CHAVE, preferencia);
    return;
  }

  await SecureStore.setItemAsync(CHAVE, preferencia);
}

function iniciarTema(): Promise<void> {
  if (!inicializacao) {
    inicializacao = (async () => {
      try {
        const salva = await lerPreferencia();

        atualizar({
          preferencia: preferenciaValida(salva)
            ? salva
            : "automatico",
          pronto: true,
          erro: null,
        });
      } catch {
        atualizar({
          pronto: true,
          erro:
            "Não foi possível recuperar sua preferência de aparência.",
        });
      }
    })();
  }

  return inicializacao;
}

export async function alterarTema(
  preferencia: PreferenciaTema
): Promise<boolean> {
  await iniciarTema();

  if (estado.salvando) return false;

  atualizar({
    salvando: true,
    erro: null,
  });

  try {
    await gravarPreferencia(preferencia);

    atualizar({
      preferencia,
      salvando: false,
      erro: null,
    });

    return true;
  } catch {
    atualizar({
      salvando: false,
      erro:
        "Não foi possível salvar a aparência. Tente novamente.",
    });

    return false;
  }
}

export function useTema() {
  const sistema = useColorScheme();

  const atual = useSyncExternalStore(
    assinar,
    obterEstado,
    obterEstadoServidor
  );

  useEffect(() => {
    void iniciarTema();
  }, []);

  const tema =
    atual.preferencia === "automatico"
      ? sistema === "dark"
        ? "escuro"
        : "claro"
      : atual.preferencia;

  return {
    ...atual,
    tema,
    colors: tema === "escuro" ? darkColors : lightColors,
    alterarTema,
  };
}

const cacheEstilos = new WeakMap<
  object,
  Map<Cores, unknown>
>();

export function usarEstilosTema<T>(
  criar: (colors: Cores) => T,
  colors: Cores
): T {
  let cache = cacheEstilos.get(criar);

  if (!cache) {
    cache = new Map<Cores, unknown>();
    cacheEstilos.set(criar, cache);
  }

  if (!cache.has(colors)) {
    cache.set(colors, criar(colors));
  }

  return cache.get(colors) as T;
}