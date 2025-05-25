import React, { useState } from "react";

export default function SetForm({ onAddSet }) {
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [piezas, setPiezas] = useState("");
  const [ano, setAno] = useState("");
  const [tema, setTema] = useState("");
  const [estado, setEstado] = useState("nuevo");
  const [deseado, setDeseado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !numero.trim()) return;

    const nuevoSet = {
      nombre: nombre.trim(),
      numero: numero.trim(),
      piezas: piezas !== "" ? parseInt(piezas, 10) : null,
      ano: ano !== "" ? parseInt(ano, 10) : null,
      tema: tema.trim(),
      estado,
      deseado,
    };

    onAddSet(nuevoSet);

    // Limpiar formulario
    setNombre("");
    setNumero("");
    setPiezas("");
    setAno("");
    setTema("");
    setEstado("nuevo");
    setDeseado(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Agregar Set LEGO</h2>

      <input
        type="text"
        placeholder="Nombre del Set"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <input
        type="text"
        placeholder="Número del Set"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <input
        type="number"
        placeholder="Cantidad de piezas"
        value={piezas}
        onChange={(e) => setPiezas(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        min="0"
      />
      <input
        type="number"
        placeholder="Año de lanzamiento"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        min="1900"
        max="2100"
      />

      <select
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="">Seleccionar Tema</option>
        <option value="Star Wars">Star Wars</option>
        <option value="Technic">Technic</option>
        <option value="City">City</option>
        <option value="Creator">Creator</option>
        <option value="Harry Potter">Harry Potter</option>
        {/* Agrega más temas si lo deseas */}
      </select>

      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="nuevo">Nuevo</option>
        <option value="usado">Usado</option>
      </select>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={deseado}
          onChange={(e) => setDeseado(e.target.checked)}
        />
        <span>Deseado</span>
      </label>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Agregar Set
      </button>
    </form>
  );
}
