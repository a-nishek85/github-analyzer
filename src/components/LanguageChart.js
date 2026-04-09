import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function LanguageChart({ repos }) {
  const languageCount = {};

  repos.forEach((repo) => {
    if (repo.language) {
      languageCount[repo.language] =
        (languageCount[repo.language] || 0) + 1;
    }
  });

  if (Object.keys(languageCount).length === 0) {
    return <p>No language data available</p>;
  }

  // ✅ Convert to sorted top 5 languages
  const sorted = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(([lang]) => lang);
  const values = sorted.map(([, count]) => count);

  // 🎨 Colors (GitHub-like)
  const colors = [
    "#f1e05a", // JS
    "#3572A5", // Python
    "#e34c26", // HTML
    "#563d7c", // CSS
    "#2b7489", // TS
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Languages",
        data: values,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // ⚙️ Chart options
  const options = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white", // change to black if light bg
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} repos (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "400px", margin: "20px auto" }}>
      <h3>Language Usage 📊</h3>
      <Pie data={data} options={options} />
    </div>
  );
}

export default LanguageChart;