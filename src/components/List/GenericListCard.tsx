"use client"; // Necesario para manejar eventos de clic en Next.js

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GenericListItem } from "@/types/generic-list-item";

interface GenericListCardProps {
  listData: GenericListItem[];
  cardTitle: string;
  cardActions?: React.ReactNode;
  generateHref: (id: string) => string;
}

const GenericListCard: React.FC<GenericListCardProps> = ({
  listData,
  cardTitle,
  cardActions,
  generateHref,
}) => {
  const router = useRouter();

  // Función para obtener las iniciales de las dos primeras palabras de un texto
  const getInitials = (name: string): string => {
    if (!name) return "N/A";
    const words = name.trim().split(/\s+/);
    return (
      words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("") || "N/A"
    );
  };

  // Manejar clic en un item
  const handleItemClick = (id: string) => {
    const url = generateHref(id);
    router.push(url);
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      {/* Cabecera con título y acciones */}
      <div className="mb-6 flex items-center justify-between px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          {cardTitle}
        </h4>
        {cardActions && <div>{cardActions}</div>}
      </div>

      {/* Lista */}
      <div>
        {listData.map((item) => {
          const itemHref = generateHref(item.id);
          return (
            <Link
              key={item.id}
              href={itemHref}
              className="flex cursor-pointer items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.id);
              }}
            >
              {/* Avatar con iniciales */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {getInitials(item.name)}
              </div>

              {/* Información y acciones */}
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {item.name}
                  </h5>
                  <p>
                    <span className="text-sm text-black dark:text-white">
                      {item.text}
                    </span>
                  </p>
                </div>
                {item.actions && <div className="ml-4">{item.actions}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GenericListCard;
