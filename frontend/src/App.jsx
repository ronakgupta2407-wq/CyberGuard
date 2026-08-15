import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadBox from "./components/Uploadbox";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <UploadBox />
    </div>
  );
}

export default App;