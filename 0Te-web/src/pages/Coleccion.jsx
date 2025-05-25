import React, { useState, useEffect } from "react";
import SetForm from "../SetForm";
import SetList from "../SetList";
import SetFilters from "../SetFilters";

export default function Coleccion() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tema: "", ano: "", estado: "", deseado: "" });

  useEffect(() => {
    fetch("http://localhost:4000/sets")
      .then((res) => res.json())
      .then((data) => {
        setSets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar sets:", err);
        setLoading(false);
      });
  }, []);

  const addSet = (nuevoSet) => {
    fetch("http://localhost:4000/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoSet),
    })
      .then((res) => res.json())
      .then((savedSet) => {
        setSets((prev) => [savedSet, ...prev]);
      })
      .catch((err) => console.error("Error al agregar set:", err));
  };

  const deleteSet = (id) => {
    fetch(`http://localhost:4000/sets/${id}`, { method: "DELETE" })
      .then(() => {
        setSets((prev) => prev.filter((set) => set.id !== id));
      })
      .catch((err) => console.error("Error al eliminar set:", err));
  };

  const clearAll = () => {
    if (window.confirm("¿Seguro que quieres eliminar toda la colección?")) {
      Promise.all(
        sets.map((set) =>
          fetch(`http://localhost:4000/sets/${set.id}`, { method: "DELETE" })
        )
      )
        .then(() => setSets([]))
        .catch((err) => console.error("Error al limpiar sets:", err));
    }
  };

  const filteredSets = sets.filter((set) => {
    return (
      (filters.tema === "" || (set.tema && set.tema.toLowerCase().includes(filters.tema.toLowerCase()))) &&
      (filters.ano === "" || set.ano === parseInt(filters.ano)) &&
      (filters.estado === "" || set.estado === filters.estado) &&
      (filters.deseado === "" || set.deseado === parseInt(filters.deseado))
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">
        0TeBrick - Colección
      </h1>

      <LegoForm onAddSet={addSet} />
      <LegoFilters filters={filters} setFilters={setFilters} />

      <div className="max-w-xl mx-auto text-right mt-4">
        <button
          onClick={clearAll}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Limpiar colección
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Cargando sets...</p>
      ) : (
        <LegoList sets={filteredSets} onDeleteSet={deleteSet} />
      )}
    </div>
  );
}
