// src/pages/Home.jsx
import React from "react";
import SearchBar from "../components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-start pt-24 sm:pt-32 bg-white px-4 text-center">
      <h1 className="sr-only">0TeBrick</h1>
      <img
        src="/logo.png" alt="0TeBrick Logo" className="w-64 h-auto mb-8 sm:w-80 md:w-96 lg:w-[400px]" />
      <SearchBar />
    </div>
  );
}
