export type GenericListItem = {
  id: string;
  avatar: string;
  name: string;
  text: string;
  time: number;
  textCount: number;
  dot: number;
  actions?: React.ReactNode; // 👈 Agregado para permitir acciones personalizadas como "Modificar"
};