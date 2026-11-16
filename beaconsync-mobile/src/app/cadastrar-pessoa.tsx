import CadastroPessoaScreen from "../screens/CadastroPessoaScreen";
import { useSessao } from "../hooks/useSessao";

export default function CadastrarPessoaRoute() {
  const { autenticado } = useSessao();

  return (
    <CadastroPessoaScreen
      integracaoJava={autenticado}
    />
  );
}