import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

type TabIconProps = {
  icon: LucideIcon;
  color: string;
  focused: boolean;
};

export default function TabIcon({
  icon: Icon,
  color,
  focused,
}: TabIconProps) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View
      style={[
        styles.container,
        focused && styles.selected,
      ]}
    >
      <Icon size={22} color={color} strokeWidth={1.8} />
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: colors.primaryLight,
  },
}));