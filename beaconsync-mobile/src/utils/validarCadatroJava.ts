import type {
  DadosCadastroPessoa,
  ErrosCadastroPessoa,
  EtapaCadastro,
  TipoVulnerabilidadeJava,
} from "../types/cadastroPessoa";

export const categoriasVulnerabilidade: {
  valor: TipoVulnerabilidadeJava;
  titulo: string;
}[] = [
  {
    valor: "ACAMADO",
    titulo: "Pessoa acamada",
  },
  {
    valor: "PESSOA_COM_DEFICIENCIA",
    titulo: "Pessoa com deficiência",
  },
  {
    valor: "BEBE",
    titulo: "Bebê",
  },
  {
    valor: "DEPENDENTE_APARELHO_MEDICO",
    titulo: "Dependência de equipamento médico",
  },
  {
    valor: "OUTRO",
    titulo: "Outra condição",
  },
];

export function formatarCpf(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function cpfValido(valor: string): boolean {
  const numeros = valor.replace(/\D/g, "");

  if (
    numeros.length !== 11 ||
    /^(\d)\1{10}$/.test(numeros)
  ) {
    return false;
  }

  for (const tamanho of [9, 10]) {
    let soma = 0;

    for (let indice = 0; indice < tamanho; indice += 1) {
      soma += Number(numeros[indice]) * (tamanho + 1 - indice);
    }

    const resto = soma % 11;
    const digito = resto < 2 ? 0 : 11 - resto;

    if (Number(numeros[tamanho]) !== digito) {
      return false;
    }
  }

  return true;
}

export function validarCadastroJava(
  dados: DadosCadastroPessoa,
  etapa: EtapaCadastro
): ErrosCadastroPessoa {
  const erros: ErrosCadastroPessoa = {};

  if (etapa === 1) {
    if (!cpfValido(dados.cpf ?? "")) {
      erros.cpf = "Informe um CPF válido.";
    }

    if (dados.nome.trim().length > 120) {
      erros.nome = "O nome deve ter até 120 caracteres.";
    }
  }

  if (etapa === 2) {
    const categoriaValida = categoriasVulnerabilidade.some(
      (categoria) =>
        categoria.valor === dados.tipoVulnerabilidade
    );

    if (!categoriaValida) {
      erros.tipoVulnerabilidade =
        "Selecione a categoria principal.";
    }
  }

  if (etapa === 3) {
    if (
      typeof dados.distritoId !== "number" ||
      !Number.isSafeInteger(dados.distritoId) ||
      dados.distritoId <= 0
    ) {
      erros.distritoId = "Selecione um distrito.";
    }

    const limites = [
      ["nomeLocal", 60],
      ["rua", 150],
      ["numero", 10],
      ["complemento", 60],
    ] as const;

    for (const [campo, limite] of limites) {
      if (dados[campo].trim().length > limite) {
        erros[campo] =
          `Use no máximo ${limite} caracteres.`;
      }
    }
  }

  return erros;
}