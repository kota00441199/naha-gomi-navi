import { BrowserRouter, Routes, Route } from "react-router-dom";
import  App from "./page";
import { WasteList } from "./WasteList";

function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/waste-list" element={<WasteList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Home;