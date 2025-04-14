import { GenericListItem } from "@/types/generic-list-item";

export class GenericListMapper {
  /**
   * Convierte datos genéricos `{ id, name, description }` en la estructura de `GenericListItem`
   * @param data Array de objetos con `id`, `name` y `description`
   * @returns Array de `GenericListItem`
   */
  static mapToGenericListItem(data: { id: string; name: string; description: string }[]): GenericListItem[] {
    return data.map((item) => ({
      id: item.id,
      avatar: "/images/user/default-avatar.png", // Avatar por defecto
      name: item.name,
      text: item.description, // `description` mapeado a `text`
      time: Math.floor(Math.random() * 30) + 1, // Tiempo aleatorio entre 1 y 30
      textCount: Math.floor(Math.random() * 5), // Número aleatorio de `textCount`
      dot: Math.floor(Math.random() * 3) + 1, // Valor aleatorio para `dot`
    }));
  }
}
