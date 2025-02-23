import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const PolynomialGraph = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Polynomial function (e.g., y = x^3 - 6x^2 + 11x - 6)
    const polynomial = (x) => x ** 3 - 6 * x ** 2 + 11 * x - 6;

    // Generate data points for the graph
    const xValues = [];
    const yValues = [];
    for (let x = -1; x <= 4; x += 0.1) {
      xValues.push(x.toFixed(2));
      yValues.push(polynomial(x).toFixed(2));
    }

    // Find the zeroes of the polynomial
    const zeroes = [1, 2, 3]; // Known zeroes of y = x^3 - 6x^2 + 11x - 6

    // Destroy existing chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create the chart
    const ctx = document.getElementById("polynomialChart").getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [
          {
            label: "Polynomial Function (y = x^3 - 6x^2 + 11x - 6)",
            data: yValues,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
          {
            label: "X-Intercepts (Zeroes)",
            data: zeroes.map((x) => ({ x, y: 0 })),
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
            text: "Polynomial Graph with X-Intercepts",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataset.label === "X-Intercepts (Zeroes)") {
                  return `Zero: (${context.raw.x}, ${context.raw.y})`;
                }
                return `(${context.label}, ${context.raw})`;
              },
            },
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

    // Cleanup chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <canvas id="polynomialChart" width="800" height="400"></canvas>;
};

export default PolynomialGraph;
