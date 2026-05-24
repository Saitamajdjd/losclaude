import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Presentation from './pages/Presentation';

export default function App() {
  return (
    <div className="min-h-screen bg-los-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/apresentacao" element={<Presentation />} />
      </Routes>
    </div>
  );
}
