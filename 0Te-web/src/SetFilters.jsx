import React from "react";

export default function SetFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-xl mx-auto mb-6 p-4 bg-white rounded shadow space-y-2">
      <h2 className="text-lg font-semibold">Filtrar sets</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="tema"
          value={filters.tema}
          onChange={handleChange}
          placeholder="Tema"
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="ano"
          value={filters.ano}
          onChange={handleChange}
          placeholder="Año"
          className="border p-2 rounded"
        />

        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Todos</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>

        <select
          name="deseado"
          value={filters.deseado}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Todos</option>
          <option value="1">Deseado</option>
          <option value="0">No deseado</option>
        </select>
      </div>
    </div>
  );
}
