import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
);

const PolynomialGraph = ({ coefficients }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    const calculatePolynomial = (x) => {
      return coefficients.reduce(
        (sum, coeff, index) =>
          sum + coeff * Math.pow(x, coefficients.length - 1 - index),
        0,
      );
    };

    const findZeros = () => {
      // A basic numeric approach to find zeros (brute force search for illustration purposes)
      const zeros = [];
      for (let x = -10; x <= 10; x += 0.01) {
        if (Math.abs(calculatePolynomial(x)) < 0.01) {
          zeros.push(parseFloat(x.toFixed(2)));
        }
      }
      return [...new Set(zeros)];
    };

    const zeros = findZeros();

    const xValues = Array.from({ length: 200 }, (_, i) => i / 10 - 10); // Generate x-values from -10 to 10
    const yValues = xValues.map((x) => calculatePolynomial(x));

    new Chart(ctx, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [
          {
            label: "Polynomial Function",
            data: yValues,
            borderColor: "blue",
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: "Zeros",
            data: zeros.map((zero) => ({ x: zero, y: 0 })),
            borderColor: "red",
            backgroundColor: "red",
            showLine: false,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
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
  }, [coefficients]);

  return <canvas ref={chartRef} width={400} height={400}></canvas>;
};

export default function App() {
  const coefficients = [1, -6, 11, -6]; // Example: x^3 - 6x^2 + 11x - 6 (zeros: 1, 2, 3)

  return (
    <div>
      <h1>Polynomial Function Graph</h1>
      <PolynomialGraph coefficients={coefficients} />
    </div>
  );
}
