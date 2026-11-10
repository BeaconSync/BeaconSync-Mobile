export const especialidadesVoluntario = [
  "Organização de doações",
  "Preparação e distribuição de alimentos",
  "Apoio em abrigos",
  "Transporte e logística",
  "Outro",
] as const;

export type EspecialidadeVoluntario =
  (typeof especialidadesVoluntario)[number];

export type DadosCadastroVoluntario = {
  telefone: string;
  cidade: string;
  uf: string;
  especialidade: EspecialidadeVoluntario | "";
  outraEspecialidade: string;
  disponivel: boolean;
  observacoes: string;
};

export type EnviarCadastroVoluntario = (
  dados: DadosCadastroVoluntario
) => Promise<void>;

export type Voluntario = Omit<
  DadosCadastroVoluntario,
  "especialidade"
> & {
  id: string;
  especialidade: EspecialidadeVoluntario;
  atualizadoEm: string | null;
};

export type EstadoVoluntario =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; voluntario: Voluntario };

export type AtualizarDisponibilidadeVoluntario = (
  voluntarioId: string,
  disponivel: boolean
) => Promise<Voluntario>;

export type SalvarDadosVoluntario = (
  voluntarioId: string,
  dados: DadosCadastroVoluntario
) => Promise<Voluntario>;