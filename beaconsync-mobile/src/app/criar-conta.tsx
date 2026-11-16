import CadastroUsuarioScreen from "../screens/CadastroUsuarioScreen";

import {
  cadastrarUsuario,
} from "../services/cadastroUsuario";

export default function CriarContaRoute() {
  return (
    <CadastroUsuarioScreen
      onCadastro={cadastrarUsuario}
    />
  );
}