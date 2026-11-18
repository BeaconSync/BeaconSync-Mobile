import { api } from "./api";

export type CorDistrito =
  | "AZUL"
  | "AMARELO"
  | "LARANJA"
  | "VERMELHO";

export type DistritoMonitorado = {
  id: string;
  nome: string;
  total: number;
  pendentes: number;
  precisamAjuda: number;
  semContato: number;
  cor: CorDistrito;
};

export type MapaAlerta = {
  alertaId: string;
  titulo: string;
  status: "ATIVO" | "ENCERRADO";
  total: number;
  distritos: DistritoMonitorado[];
};

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function quantidade(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isSafeInteger(valor) &&
    valor >= 0
  );
}

function corValida(valor: unknown): valor is CorDistrito {
  return (
    valor === "AZUL" ||
    valor === "AMARELO" ||
    valor === "LARANJA" ||
    valor === "VERMELHO"
  );
}

function converterDistrito(
  valor: unknown
): DistritoMonitorado {
  if (
    !objeto(valor) ||
    !quantidade(valor.distritoId) ||
    valor.distritoId === 0 ||
    typeof valor.nome !== "string" ||
    !valor.nome.trim() ||
    !quantidade(valor.total) ||
    !quantidade(valor.pendentes) ||
    !quantidade(valor.precisamAjuda) ||
    !quantidade(valor.semContato) ||
    !corValida(valor.cor) ||
    valor.total !==
      valor.pendentes + valor.precisamAjuda + valor.semContato
  ) {
    throw new Error(
      "A API retornou contagens inválidas para um distrito."
    );
  }

  return {
    id: String(valor.distritoId),
    nome: valor.nome,
    total: valor.total,
    pendentes: valor.pendentes,
    precisamAjuda: valor.precisamAjuda,
    semContato: valor.semContato,
    cor: valor.cor,
  };
}

export async function consultarMapaAlerta(
  id: string
): Promise<MapaAlerta> {
  if (
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(Number(id))
  ) {
    throw new Error("Identificador do alerta inválido.");
  }

  const resposta = await api<unknown>(
    "java",
    `/api/v1/alertas/${id}/mapa`,
    {}
  );

  if (
    !objeto(resposta) ||
    resposta.alertaId !== Number(id) ||
    typeof resposta.titulo !== "string" ||
    !resposta.titulo.trim() ||
    (
      resposta.status !== "ATIVO" &&
      resposta.status !== "ENCERRADO"
    ) ||
    !quantidade(resposta.totalSemSeguranca) ||
    !Array.isArray(resposta.distritos)
  ) {
    throw new Error(
      "A API retornou um monitoramento em formato inesperado."
    );
  }

  const distritos =
    resposta.distritos.map(converterDistrito);

  const soma = distritos.reduce(
    (total, distrito) => total + distrito.total,
    0
  );

  if (
    new Set(distritos.map((item) => item.id)).size !==
      distritos.length ||
    !Number.isSafeInteger(soma) ||
    soma !== resposta.totalSemSeguranca
  ) {
    throw new Error(
      "As contagens dos distritos não conferem com o total do alerta."
    );
  }

  return {
    alertaId: id,
    titulo: resposta.titulo,
    status: resposta.status,
    total: resposta.totalSemSeguranca,
    distritos,
  };
}