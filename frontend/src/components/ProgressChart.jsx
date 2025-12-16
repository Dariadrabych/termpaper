import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function ProgressChart({ token }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [progress, setProgress] = useState([]);

  const authToken = token || localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) return;

    async function loadProgress() {
      try {
        const res = await fetch("http://localhost:4000/api/progress", {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!res.ok) return;

        const data = await res.json();

        const formatted = data.map((row, index) => ({
          label: `Спроба ${index + 1}`,
          value: row.percent
        }));

        setProgress(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    loadProgress();
  }, [authToken]);

  useEffect(() => {
    if (!progress.length) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) chartRef.current.destroy();

    // beautiful gradient line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "#ffb84d");
    gradient.addColorStop(1, "rgba(255, 184, 77, 0.1)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: progress.map((p) => p.label),
        datasets: [
          {
            label: "Результати тестів (%)",
            data: progress.map((p) => p.value),
            borderColor: "#ffb84d",
            backgroundColor: gradient,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: "#ffb84d",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
          duration: 800,
          easing: "easeOutQuart"
        },

        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: "white",
              stepSize: 10,
              font: { size: 13 }
            },
            grid: {
              color: "rgba(255,255,255,0.08)"
            }
          },
          x: {
            ticks: {
              color: "white",
              maxRotation: 60,
              minRotation: 40,
              font: { size: 12 }
            },
            grid: {
              color: "rgba(255,255,255,0.05)"
            }
          }
        },

        plugins: {
          legend: {
            labels: {
              color: "white",
              font: { size: 14 }
            }
          },
          tooltip: {
            backgroundColor: "#1e1e1e",
            titleColor: "#fff",
            bodyColor: "#ffb84d",
            borderColor: "#ffb84d",
            borderWidth: 1
          }
        }
      }
    });
  }, [progress]);

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        padding: "20px",
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
