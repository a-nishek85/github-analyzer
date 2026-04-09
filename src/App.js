import axios from "axios";
import { useState } from "react";
import LanguageChart from "./components/LanguageChart";

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH FROM BACKEND
  const fetchData = async () => {
    if (!username) return alert("Enter username");

    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/github/${username}`
      );

      setUser(res.data.user);
      setRepos(res.data.repos);
    } catch {
      alert("User not found");
      setUser(null);
      setRepos([]);
    }

    setLoading(false);
  };

  // 💾 SAVE USER TO DB
  const saveUser = async () => {
    if (!user) return;

    const totalStars = repos.reduce(
      (sum, r) => sum + r.stargazers_count,
      0
    );

    await axios.post("http://localhost:5000/save-user", {
      username: user.login,
      totalRepos: repos.length,
      totalStars: totalStars,
    });

    alert("Saved to DB ✅");
  };

  // 🔥 LANGUAGE FUNCTIONS
  const getLanguageStats = (repos) => {
    const langCount = {};
    repos.forEach((repo) => {
      if (repo.language) {
        langCount[repo.language] =
          (langCount[repo.language] || 0) + 1;
      }
    });
    return langCount;
  };

  const getTopLanguage = (langCount) => {
    let topLang = "";
    let max = 0;

    for (let lang in langCount) {
      if (langCount[lang] > max) {
        max = langCount[lang];
        topLang = lang;
      }
    }

    return topLang;
  };

  // 🔥 CALCULATIONS
  const langCount = getLanguageStats(repos);
  const topLang = getTopLanguage(langCount);

  const totalStars = repos.reduce(
    (acc, repo) => acc + repo.stargazers_count,
    0
  );

  const sortedRepos = [...repos].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  );

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        background: "#6ba6fd",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>GitHub Analyzer 🔍</h1>

      {/* Search */}
      <input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "10px",
          marginRight: "10px",
          borderRadius: "5px",
          border: "none",
        }}
      />

      <button
        onClick={fetchData}
        style={{
          padding: "10px 20px",
          background: "#1f1f24",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {/* Loading */}
      {loading && <h2>Loading...</h2>}

      {/* Profile */}
      {user && (
        <div
          style={{
            marginTop: "20px",
            background: "#7996d0",
            padding: "20px",
            borderRadius: "10px",
            display: "inline-block",
          }}
        >
          <img
            src={user.avatar_url}
            width="100"
            style={{ borderRadius: "50%" }}
            alt="avatar"
          />
          <h2>{user.name}</h2>
          <p>{user.bio}</p>
          <p>👥 Followers: {user.followers}</p>
          <p>📦 Repos: {user.public_repos}</p>

          {/* SAVE BUTTON */}
          <button
            onClick={saveUser}
            style={{
              marginTop: "10px",
              padding: "8px 15px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Save User
          </button>
        </div>
      )}

      {/* Stats */}
      {repos.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>⭐ Total Stars: {totalStars}</h3>
          <h3>📁 Total Repos: {repos.length}</h3>
          <h3>🔥 Top Language: {topLang}</h3>
        </div>
      )}

      {/* Chart */}
      {repos.length > 0 && (
        <LanguageChart repos={repos} />
      )}

      {/* Repo List */}
      {repos.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Top Repositories</h2>

          {sortedRepos.slice(0, 10).map((repo) => (
            <div
              key={repo.id}
              style={{
                background: "#e6d28b",
                padding: "15px",
                margin: "10px auto",
                width: "60%",
                borderRadius: "8px",
              }}
            >
              <h4>{repo.name}</h4>
              <p>⭐ {repo.stargazers_count}</p>
              <p>🍴 {repo.forks_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;