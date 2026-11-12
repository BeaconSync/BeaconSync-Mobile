export type ClassificacaoBairro = "baixa" | "media" | "alta";

export type Posicao = [longitude: number, latitude: number];

export type GeometriaBairro =
  | {
      type: "Polygon";
      coordinates: Posicao[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: Posicao[][][];
    };

export type DadosBairro = {
  id: string;
  nome: string;

  totalPessoas: number | null;

  idosos: number | null;
  pcds: number | null;

  classificacao: ClassificacaoBairro | null;
  atualizadoEm: string | null;
};

export type BairroGeoJSON = {
  type: "Feature";
  properties: DadosBairro;
  geometry: GeometriaBairro | null;
};

export type DadosMapaBairros = {
  type: "FeatureCollection";
  features: BairroGeoJSON[];
};

export type EstadoMonitoramento =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; dados: DadosMapaBairros };

export type CoordenadaMapa = {
  latitude: number;
  longitude: number;
};

export type BairroNoMapa = DadosBairro & {
  cor: string;
  rotulo: string;

  poligonos: {
    contorno: CoordenadaMapa[];
    buracos: CoordenadaMapa[][];
  }[];
};

export type MapaBairrosProps = {
  bairros: BairroNoMapa[];
  selecionadoId: string | null;
  onSelecionar: (id: string) => void;
};