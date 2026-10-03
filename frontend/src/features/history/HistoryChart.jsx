import { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

export default function HistoryChart({ points }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !points.length) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: points.map((p) => p.label),
        datasets: [{
          data: points.map((p) => p.score),
          backgroundColor: points.map((_, i) => (i === points.length - 1 ? '#ff4f1f' : '#101828')),
          borderRadius: 2,
          maxBarThickness: 28,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} pts` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#5b6678', font: { family: 'Barlow' } } },
          y: { beginAtZero: true, grid: { color: '#dde2ea' }, ticks: { color: '#5b6678', font: { family: 'Barlow' } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [points]);

  if (!points.length) {
    return <p className="text-muted">Todavía no hay sesiones completadas.</p>;
  }
  return (
    <div className="h-56">
      <canvas ref={canvasRef} role="img" aria-label="Puntuación de las últimas sesiones" />
    </div>
  );
}
