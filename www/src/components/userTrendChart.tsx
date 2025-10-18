import { useRef } from "react";


interface UserTrendChartProps {
  data: number[];
}

/**
 * Chart component for displaying Line Chart (User Trend).
 * Uses useRef and useEffect to integrate Chart.js.
 */
const UserTrendChart: React.FC<UserTrendChartProps> = ({ data }) => {
  // Specify the ref type for a canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref for the Chart.js instance itself
  const chartInstance = useRef<any>(null); // Use any for Chart.js instance as its type is complex

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const dates: string[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0].substring(5); // Format MM-DD
    });

    // Ensure window.Chart is available before instantiation
    if (window.Chart) {
      chartInstance.current = new window.Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "New Signups",
              data: data,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { type: "category", title: { display: true, text: "Day" } },
            y: { beginAtZero: true, title: { display: true, text: "Users" } },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        User Sign-up Trend (Past 30 Days)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Tracks daily user acquisition, indicating marketing effectiveness and
        platform growth velocity.
      </p>
      <div className="chart-container h-[350px]">
        <canvas ref={canvasRef} id="userTrendChart"></canvas>
      </div>
    </div>
  );
};
