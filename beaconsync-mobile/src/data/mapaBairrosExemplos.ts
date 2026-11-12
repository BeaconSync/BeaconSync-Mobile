import type {
  BairroGeoJSON,
  DadosBairro,
  EstadoMonitoramento,
} from "../types/monitoramento";

// Retângulos fictícios para testar a interface.
function bairroExemplo(
  dados: DadosBairro,
  oeste: number,
  sul: number
): BairroGeoJSON {
  const leste = oeste + 0.014;
  const norte = sul + 0.012;

  return {
    type: "Feature",
    properties: dados,

    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [oeste, sul],
          [leste, sul],
          [leste, norte],
          [oeste, norte],
          [oeste, sul],
        ],
      ],
    },
  };
}

const atualizadoEm = "2026-11-10T10:00:00-03:00";

export const mapaBairrosExemplo: EstadoMonitoramento = {
  status: "sucesso",

  dados: {
    type: "FeatureCollection",

    features: [
      bairroExemplo(
        {
          id: "bairro-a",
          nome: "Bairro A · exemplo",
          totalPessoas: 80,
          idosos: 55,
          pcds: 35,
          classificacao: "alta",
          atualizadoEm,
        },
        -46.65,
        -23.55
      ),

      bairroExemplo(
        {
          id: "bairro-b",
          nome: "Bairro B · exemplo",
          totalPessoas: 35,
          idosos: 25,
          pcds: 14,
          classificacao: "media",
          atualizadoEm,
        },
        -46.635,
        -23.55
      ),

      bairroExemplo(
        {
          id: "bairro-c",
          nome: "Bairro C · exemplo",
          totalPessoas: 8,
          idosos: 5,
          pcds: 4,
          classificacao: "baixa",
          atualizadoEm,
        },
        -46.65,
        -23.563
      ),

      bairroExemplo(
        {
          id: "bairro-d",
          nome: "Bairro D · exemplo",
          totalPessoas: null,
          idosos: null,
          pcds: null,
          classificacao: null,
          atualizadoEm: null,
        },
        -46.635,
        -23.563
      ),
    ],
  },
};