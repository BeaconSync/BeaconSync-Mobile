import { api } from "./api";

export type AnaliseDistrito = {
  status: "GERADO" | "DEMONSTRACAO" | "SEM_BASE";
  analise: string;
  boletim_dados: string;
  gerado_em: string;
  avisos: string[];
};

function objeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

export async function analisarDistrito(
  alertaId: string,
  distritoId: string,
): Promise<AnaliseDistrito> {
  for (const id of [alertaId, distritoId]) {
    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(Number(id))
    ) {
      throw new Error("Alerta ou distrito inválido.");
    }
  }

  const resposta = await api<unknown>(
    "java",
    `/api/v1/alertas/${alertaId}/distritos/${distritoId}/analise`,
    {
      metodo: "POST",
      timeoutMs: 120000,
      dados: {
        pergunta:
          "Explique as necessidades de apoio deste distrito com base nos dados disponíveis e destaque as limitações das informações.",
      },
    },
  );

  if (
    !objeto(resposta) ||
    resposta.alerta_id !== alertaId ||
    resposta.distrito_id !== distritoId ||
    !(
      resposta.status === "GERADO" ||
      resposta.status === "DEMONSTRACAO" ||
      resposta.status === "SEM_BASE"
    ) ||
    typeof resposta.analise !== "string" ||
    !resposta.analise.trim() ||
    typeof resposta.boletim_dados !== "string" ||
    typeof resposta.gerado_em !== "string" ||
    !Number.isFinite(Date.parse(resposta.gerado_em)) ||
    !Array.isArray(resposta.avisos) ||
    !resposta.avisos.every(
      (aviso: unknown) => typeof aviso === "string",
    )
  ) {
    throw new Error(
      "Não foi possível interpretar a análise deste distrito.",
    );
  }

  return {
    status: resposta.status,
    analise: resposta.analise,
    boletim_dados: resposta.boletim_dados,
    gerado_em: resposta.gerado_em,
    avisos: resposta.avisos,
  };
}