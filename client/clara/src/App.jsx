import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";
import ChatInterface from "./components/chatInterface";
import PolynomialGraph from "./components/polynomialGraph";
import InteractivePolynomialGraph from "./components/interactivePolynomialGraph";
function App() {
  return (
    <>
      <ChatInterface />
      {/* <PolynomialGraph /> */}
      {/* <InteractivePolynomialGraph /> */}
    </>
  );
}

export default App;
