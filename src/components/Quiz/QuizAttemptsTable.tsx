import { QuizAttempt } from "@/types/quiz-summary";
import { useRouter } from "next/navigation";

interface QuizAttemptsTableProps {
  quizId: string;
  attempts: QuizAttempt[];
  generateHref: (id: string) => string; // 📌 URL dinámica
}

const QuizAttemptsTable: React.FC<QuizAttemptsTableProps> = ({ quizId, attempts, generateHref }) => {
  const router = useRouter();

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-center dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white"># Intento</th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">Calificación</th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">Fecha</th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">Acción</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt, index) => (
              <tr key={attempt.id} className="text-center">
                {/* # Intento (Número secuencial) */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{index + 1}</td>

                {/* Calificación combinada */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {attempt.grade} / {attempt.maxGrade}
                </td>

                {/* Fecha */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{attempt.date}</td>

                {/* Acción - Botón con icono de ojo */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <button
                    onClick={() => router.push(generateHref(attempt.id))} // 📌 URL dinámica
                    className="text-blue-600 hover:text-blue-800"
                    title="Ver intento"
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0M2.458 12c1.837 -4.667 6.178 -8 11.542 -8s9.705 3.333 11.542 8c-1.837 4.667 -6.178 8 -11.542 8s-9.705 -3.333 -11.542 -8"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizAttemptsTable;
