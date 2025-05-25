import React from "react";

export default function SetList({ sets, onDeleteSet }) {
  if (sets.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No hay sets agregados aún.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-4">
      {sets.map(({ id, nombre, numero, piezas, ano, tema, estado, deseado }) => (
        <div
          key={id}
          className="p-4 border border-gray-300 rounded shadow-sm bg-white flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-semibold">
              {nombre} ({numero})
            </h3>
            {tema && <p><strong>Tema:</strong> {tema}</p>}
            <p><strong>Estado:</strong> {estado}</p>
            <p><strong>Piezas:</strong> {piezas !== null && piezas !== undefined ? piezas : "N/A"}</p>
            <p><strong>Año:</strong> {ano !== null && ano !== undefined ? ano : "N/A"}</p>
            {deseado && (
              <p className="mt-1 text-sm text-blue-600">⭐ En lista de deseos</p>
            )}
          </div>
          <button
            onClick={() => onDeleteSet(id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 self-start"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
