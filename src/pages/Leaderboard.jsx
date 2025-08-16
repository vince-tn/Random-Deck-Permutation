import React, { useEffect, useState } from "react";
import "./Leaderboard.css";

const Leaderboard = ({ onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("https://random-deck-permutation.onrender.com/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="leaderboard-popup">Loading...</div>;
  if (error) return <div className="leaderboard-popup">Error: {error}</div>;

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-popup">
        <div className="leaderboard-header">
          <h2>MOST CONSECUTIVE CARD MATCHES</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>
        <div className="leaderboard-table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Users</th>
                <th>Combination</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.rank + "-" + entry.users.join(",")}>
                  <td>{entry.rank}</td>
                  <td>{entry.users.join(", ")}</td>
                  <td>{entry.combination.join(" - ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
