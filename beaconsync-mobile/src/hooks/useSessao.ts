import { useSyncExternalStore } from "react";

import {
  obterEstadoSessao,
  observarSessao,
} from "../services/sessao";

export function useSessao() {
  return useSyncExternalStore(
    observarSessao,
    obterEstadoSessao,
    obterEstadoSessao,
  );
}