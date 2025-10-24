import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./Home.jsx";
import AllStores from "./AllStores";
import Store2 from "./Store2";
import Booking from "./Booking";
import Register from "./Register";
import Home2 from "./Home2";
import Analyze from "./Analyze";
import HelpCenter from "./HelpCenter";
import ArticleAcrylic from "./ArticleAcrylic";
import AboutGlamNail from "./AboutGlamNail";
import AddStore from "./AddStore";

export default function App() {
  return (
    <div className="page">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/AllStores" element={<AllStores />} />
        <Route path="/store2" element={<Store2 />} />
        <Route path="/helpCenter" element={<HelpCenter />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/articleAcrylic" element={<ArticleAcrylic />} />
        <Route path="/aboutGlamNail" element={<AboutGlamNail />} />
        <Route path="/addStore" element={<AddStore />} />
        <Route path="*" element={<div style={{padding:24}}>404 Not Found</div>} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </div>
  );
}
