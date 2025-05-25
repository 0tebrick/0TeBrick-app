import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import Coleccion from "./pages/Coleccion";
import SetDetail from "./pages/SetDetail"; // (lo crearemos luego)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resultados" element={<SearchResults />} />
        <Route path="/detalle/:setID" element={<SetDetail />} />
        <Route path="/coleccion" element={<Coleccion />} />
      </Routes>
    </Router>
  );
}

export default App;
