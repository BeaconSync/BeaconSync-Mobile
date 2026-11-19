const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript-tema");

const root = path.resolve(__dirname, "../src");

function arquivos(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((item) => {
      const caminho = path.join(dir, item.name);

      return item.isDirectory()
        ? arquivos(caminho)
        : [caminho];
    });
}

const coresFixas = {
  "#62655E": "textSecondary",
  "#76581F": "primary",
  "#AD3028": "danger",
  "#A93226": "danger",
  "#FBEDEB": "dangerBackground",
  "#FCEDEA": "dangerBackground",
  "#31715A": "success",
  "#296546": "success",
  "#EAF3ED": "successBackground",
  "#EAF4EE": "successBackground",
  "#805D1C": "warningText",
  "#242424": "text",
};

const planos = [];

for (const file of arquivos(root).filter((p) =>
  p.endsWith(".tsx")
)) {
  let source = fs.readFileSync(file, "utf8");

  const importAntigo =
    /import\s*\{\s*colors\s*\}\s*from\s*['"]([^'"]*theme\/colors)['"];?/;

  if (!importAntigo.test(source)) continue;

  source = source.replace(
    /"(#[A-Fa-f0-9]{6})"/g,
    (original, hexadecimal, offset) => {
      const nome =
        coresFixas[hexadecimal.toUpperCase()];

      if (!nome) return original;

      const antes = source.slice(0, offset);

      const atributoJsx =
        /\b(?:color|backgroundColor|borderColor)=$/.test(
          antes
        );

      return atributoJsx
        ? `{colors.${nome}}`
        : `colors.${nome}`;
    }
  );

  source = source
    .replace(
      /\bcolor:\s*colors\.surface\b/g,
      "color: colors.onPrimary"
    )
    .replace(
      /color=\{colors\.surface\}/g,
      "color={colors.onPrimary}"
    )
    .replace(
      /backgroundColor:\s*colors\.danger\b/g,
      "backgroundColor: colors.dangerButton"
    );

  const layoutPrincipal = file.endsWith(
    path.join("app", "_layout.tsx")
  );

  const mapaNativo = file.endsWith(
    "MapaBairros.native.tsx"
  );

  if (layoutPrincipal) {
    source = source.replace(
      '<StatusBar style="dark" />',
      '<StatusBar style={tema === "escuro" ? "light" : "dark"} />'
    );

    source = source.replace(
      "!pronto || erro ?",
      "!temaPronto || !pronto || erro ?"
    );
  }

  if (mapaNativo) {
    source = source.replace(
      "<MapView",
      '<MapView userInterfaceStyle={tema === "escuro" ? "dark" : "light"}'
    );
  }

  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const edicoes = [];
  const fabricas = [];

  for (const node of sf.statements) {
    if (
      !ts.isVariableStatement(node) ||
      !/\bcolors\b/.test(node.getText(sf))
    ) {
      continue;
    }

    for (const declaracao of node.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaracao.name) ||
        !declaracao.initializer ||
        node.declarationList.declarations.length !== 1
      ) {
        throw new Error(
          `Declaração precisa de revisão manual: ${file}`
        );
      }

      const nome = declaracao.name.text;

      const fabrica =
        `criar${nome[0].toUpperCase()}${nome.slice(1)}`;

      fabricas.push({ nome, fabrica });

      edicoes.push({
        inicio: node.getStart(sf),
        fim: node.end,
        texto:
          `const ${fabrica} = (colors: Cores) => (` +
          declaracao.initializer.getText(sf) +
          ");",
      });
    }
  }

  for (const node of sf.statements) {
    if (
      !ts.isFunctionDeclaration(node) ||
      !node.name ||
      !node.body
    ) {
      continue;
    }

    const corpo = node.body.getText(sf);

    const usadas = fabricas.filter((item) =>
      new RegExp(`\\b${item.nome}\\b`).test(corpo)
    );

    const usaCores = /\bcolors\b/.test(corpo);

    if (!usadas.length && !usaCores) continue;

    if (!/^[A-Z]/.test(node.name.text)) {
      throw new Error(
        `Função auxiliar precisa de revisão: ${file} / ${node.name.text}`
      );
    }

    const extras = layoutPrincipal
      ? ", tema, pronto: temaPronto"
      : mapaNativo
        ? ", tema"
        : "";

    let codigo =
      `\n  const { colors${extras} } = useTema();\n`;

    for (const item of usadas) {
      codigo +=
        `  const ${item.nome} = ` +
        `usarEstilosTema(${item.fabrica}, colors);\n`;
    }

    const posicao = node.body.getStart(sf) + 1;

    edicoes.push({
      inicio: posicao,
      fim: posicao,
      texto: codigo,
    });
  }

  edicoes
    .sort((a, b) => b.inicio - a.inicio)
    .forEach((edicao) => {
      source =
        source.slice(0, edicao.inicio) +
        edicao.texto +
        source.slice(edicao.fim);
    });

  source = source.replace(
    importAntigo,
    (_, caminho) =>
      `import { useTema, usarEstilosTema, type Cores } ` +
      `from "${caminho.replace(/colors$/, "tema")}";`
  );

  const verificacao = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  if (verificacao.parseDiagnostics.length > 0) {
    throw new Error(
      `A conversão gerou sintaxe inválida: ${file}`
    );
  }

  planos.push({ file, source });
}

for (const plano of planos) {
  fs.writeFileSync(plano.file, plano.source, "utf8");
}

console.log(
  `${planos.length} arquivos convertidos para tema dinâmico.`
);