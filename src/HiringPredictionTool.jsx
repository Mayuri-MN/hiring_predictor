import React, { useState } from 'react';
import saveAs from 'file-saver';

export default function HiringPredictionTool() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    totalHires: '',
    avgGap: '',
    daysSinceLastHire: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predict = ({ totalHires, avgGap, daysSinceLastHire }) => {
    const hires = parseInt(totalHires);
    const gap = parseFloat(avgGap);
    const days = parseInt(daysSinceLastHire);

    let score = 0;
    score += Math.min(hires * 10, 100) * 0.3;
    score += Math.max(0, 100 - gap / 2) * 0.3;
    score += Math.max(0, 100 - days / 2) * 0.4;

    let prediction = 'Low';
    if (score > 75) prediction = 'High';
    else if (score > 50) prediction = 'Medium';

    let reason = [];
    if (hires > 5) reason.push("High hire frequency");
    if (gap < 90) reason.push("Short gap between hires");
    if (days < 60) reason.push("Recently active");
    if (reason.length === 0) reason.push("Limited activity data");

    return {
      score: Math.round(score),
      prediction,
      reason: reason.join(', ')
    };
  };

  const addClient = () => {
    const result = predict(formData);
    setClients([...clients, { ...formData, ...result }]);
    setFormData({ totalHires: '', avgGap: '', daysSinceLastHire: '' });
  };

  const exportToCSV = () => {
    const csvHeader = 'Total Hires,Avg Days Between Hires,Days Since Last Hire,Score,Prediction,Reason\n';
    const csvRows = clients.map(c => `${c.totalHires},${c.avgGap},${c.daysSinceLastHire},${c.score},${c.prediction},${c.reason}`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'hiring_predictions.csv');
  };

  const getColor = (prediction) => {
    if (prediction === 'High') return 'text-green-600 font-bold';
    if (prediction === 'Medium') return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full space-y-4">
        <h2 className="text-2xl font-bold text-center">Hiring Likelihood Predictor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Total Hires"
            name="totalHires"
            value={formData.totalHires}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Avg Days Between Hires"
            name="avgGap"
            value={formData.avgGap}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Days Since Last Hire"
            name="daysSinceLastHire"
            value={formData.daysSinceLastHire}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={addClient}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Client & Predict
        </button>

        {clients.length > 0 && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold text-center">Predictions</h3>
            <table className="w-full text-sm border border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Total Hires</th>
                  <th className="p-2 border">Avg Gap</th>
                  <th className="p-2 border">Days Since Last</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Prediction</th>
                  <th className="p-2 border">Reason</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="p-2 border">{c.totalHires}</td>
                    <td className="p-2 border">{c.avgGap}</td>
                    <td className="p-2 border">{c.daysSinceLastHire}</td>
                    <td className="p-2 border font-bold">{c.score}</td>
                    <td className={`p-2 border ${getColor(c.prediction)}`}>{c.prediction}</td>
                    <td className="p-2 border text-gray-600">{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={exportToCSV}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Download as CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// Trigger redeploy
//Updated build script to fix Vercel issue


