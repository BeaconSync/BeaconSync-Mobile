import type {
  BairroGeoJSON,
  BairroNoMapa,
  Posicao,
} from "../types/monitoramento";

export const legendaMapa = [
  {
    chave: "baixa",
    rotulo: "Baixa quantidade",
    cor: "#3275A8",
  },
  {
    chave: "media",
    rotulo: "Média quantidade",
    cor: "#E5B833",
  },
  {
    chave: "alta",
    rotulo: "Alta quantidade",
    cor: "#C64B40",
  },
  {
    chave: null,
    rotulo: "Sem classificação",
    cor: "#8A9099",
  },
] as const;

export function contagemValida(
  valor: number | null
): valor is number {
  return (
    typeof valor === "number" &&
    Number.isSafeInteger(valor) &&
    valor >= 0
  );
}

export function formatarQuantidade(valor: number | null) {
  return contagemValida(valor)
    ? valor.toLocaleString("pt-BR")
    : "Não informado";
}

export function formatarAtualizacao(valor: string | null) {
  if (!valor) return "Não informada";

  const data = new Date(valor);

  return Number.isNaN(data.getTime())
    ? "Não informada"
    : data.toLocaleString("pt-BR");
}

function anelValido(anel: Posicao[]) {
  if (!Array.isArray(anel) || anel.length < 4) {
    return false;
  }

  const coordenadasValidas = anel.every(
    (ponto) =>
      Array.isArray(ponto) &&
      Number.isFinite(ponto[0]) &&
      Math.abs(ponto[0]) <= 180 &&
      Number.isFinite(ponto[1]) &&
      Math.abs(ponto[1]) <= 90
  );

  if (!coordenadasValidas) return false;

  const primeiro = anel[0];
  const ultimo = anel[anel.length - 1];

  return (
    primeiro[0] === ultimo[0] &&
    primeiro[1] === ultimo[1]
  );
}

export function prepararBairro(
  feature: BairroGeoJSON
): BairroNoMapa {
  const dados = feature.properties;

  const classe = contagemValida(dados.totalPessoas)
    ? dados.classificacao
    : null;

  const visual =
    legendaMapa.find((item) => item.chave === classe) ??
    legendaMapa[3];

  const geometria = feature.geometry;

  const partes = !geometria
    ? []
    : geometria.type === "Polygon"
      ? [geometria.coordinates]
      : geometria.coordinates;

  const poligonos = partes
    .filter(
      (aneis) =>
        aneis.length > 0 &&
        aneis.every(anelValido)
    )
    .map((aneis) => {
      const convertidos = aneis.map((anel) =>
        anel.map(([longitude, latitude]) => ({
          latitude,
          longitude,
        }))
      );

      return {
        contorno: convertidos[0],
        buracos: convertidos.slice(1),
      };
    });

  return {
    ...dados,
    cor: visual.cor,
    rotulo: visual.rotulo,
    poligonos,
  };
}