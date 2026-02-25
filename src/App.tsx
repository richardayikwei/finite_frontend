import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
// import Adventures from "./pages/Adventures"  // future feature

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/adventures" element={<Adventures />} /> */}
    </Routes>
  )
}