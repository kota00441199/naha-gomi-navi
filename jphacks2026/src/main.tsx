import { BrowserRouter, Routes, Route } from "react-router-dom";
import  App from "./App";
import { WasteList } from "./wastelist";
import { createRoot } from "react-dom/client";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
        <title>すっきり回収ナビ</title>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/waste-list" element={<WasteList />} />
      </Routes>
    </BrowserRouter>
);

