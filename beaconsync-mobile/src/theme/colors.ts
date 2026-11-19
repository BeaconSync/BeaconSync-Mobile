export const lightColors = {
  background: "#FAF9F6",
  surface: "#FFFFFF",

  primary: "#946F25",
  primaryLight: "#F3EBD9",
  onPrimary: "#FFFFFF",

  text: "#30312C",
  textSecondary: "#74776D",
  border: "#E7E4DB",

  infoBackground: "#EDF2F5",
  infoBorder: "#D7E2E8",
  infoText: "#4F6878",

  warningBackground: "#FFF2EB",
  warningBorder: "#F0C9B6",
  warningText: "#B74822",

  danger: "#AD3028",
  dangerBackground: "#FBEDEB",
  dangerButton: "#AD3028",

  success: "#296546",
  successBackground: "#EAF4EE",
};

export type Cores = {
  [Chave in keyof typeof lightColors]: string;
};

export const darkColors: Cores = {
  background: "#141510",
  surface: "#20221B",

  primary: "#E3BE70",
  primaryLight: "#353020",
  onPrimary: "#201A0D",

  text: "#F3F2EB",
  textSecondary: "#B8BAAE",
  border: "#3B3E32",

  infoBackground: "#202E36",
  infoBorder: "#3B5360",
  infoText: "#B9D8E9",

  warningBackground: "#38291F",
  warningBorder: "#70513B",
  warningText: "#FFBC91",

  danger: "#FFACA4",
  dangerBackground: "#3D2422",
  dangerButton: "#A63029",

  success: "#9DD9B6",
  successBackground: "#20362B",
};

export const colors = lightColors;