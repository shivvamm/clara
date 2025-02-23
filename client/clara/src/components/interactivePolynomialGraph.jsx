import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const InteractivePolynomialGraph = () => {
  const [coefficients, setCoefficients] = useState([1, -6, 11, -6]); // Default: y = x^3 - 6x^2 + 11x - 6
  const [zeroes, setZeroes] = useState([1, 2, 3]); // Pre-calculated zeroes (for simplicity)
  const chartRef = useRef(null);

  const polynomial = (x, coeffs) =>
    coeffs.reduce(
      (sum, coef, index) => sum + coef * x ** (coeffs.length - 1 - index),
      0,
    );

  const updateZeroes = (coeffs) => {
    // Placeholder: In real cases, you could calculate the roots using a library like math.js
    if (JSON.stringify(coeffs) === JSON.stringify([1, -6, 11, -6])) {
      return [1, 2, 3]; // Known roots for this polynomial
    }
    return []; // Default: no roots calculated
  };

  useEffect(() => {
    const xValues = [];
    const yValues = [];
    for (let x = -10; x <= 10; x += 0.1) {
      xValues.push(x.toFixed(2));
      yValues.push(polynomial(x, coefficients).toFixed(2));
    }

    const currentZeroes = updateZeroes(coefficients);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document
      .getElementById("interactivePolynomialChart")
      .getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [
          {
            label: "Polynomial Function",
            data: yValues,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
          {
            label: "X-Intercepts (Zeroes)",
            data: currentZeroes.map((x) => ({ x, y: 0 })),
            backgroundColor: "red",
            borderColor: "red",
            type: "scatter",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Interactive Polynomial Graph",
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "X-Axis",
            },
          },
          y: {
            title: {
              display: true,
              text: "Y-Axis",
            },
          },
        },
      },
    });

    setZeroes(currentZeroes);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [coefficients]);

  const handleCoefficientChange = (index, value) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = parseFloat(value) || 0;
    setCoefficients(newCoefficients);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center text-blue-500">
        Interactive Polynomial Graph
      </h1>

      <div className="space-y-4">
        <label className="block text-gray-300">
          Enter Coefficients (e.g., for y = ax^3 + bx^2 + cx + d, enter a, b, c,
          d):
        </label>
        <div className="flex space-x-2">
          {coefficients.map((coef, index) => (
            <input
              key={index}
              type="number"
              value={coef}
              onChange={(e) => handleCoefficientChange(index, e.target.value)}
              className="w-16 p-2 text-gray-700 bg-gray-200 border border-gray-400 rounded"
            />
          ))}
        </div>
      </div>

      <canvas id="interactivePolynomialChart" width="800" height="400"></canvas>

      <div>
        <h2 className="text-xl text-gray-300">
          Detected Zeroes (X-Intercepts):
        </h2>
        <ul className="list-disc pl-6 text-gray-200">
          {zeroes.length > 0
            ? zeroes.map((zero, index) => <li key={index}>{zero}</li>)
            : "No zeroes detected or calculation unavailable for this polynomial."}
        </ul>
      </div>
    </div>
  );
};

export default InteractivePolynomialGraph;
