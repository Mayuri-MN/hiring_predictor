import React, { useState } from 'react';
import Papa from 'papaparse';
import saveAs from 'file-saver';

export default function ClientInsightsTool() {
  const [clients, setClients] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsed = results.data.map((row) => {
          const today = new Date();
          const lastHire = new Date(row.LastHireDate);
          const daysSinceLastHire = Math.floor((today - lastHire) / (1000 * 60 * 60 * 24));
          const avgGap = parseFloat(row.AvgDaysBetweenHires);

          let likelihood = 'Low';
          let reason = 'Recently hired';

          if (daysSinceLastHire >= avgGap * 0.9) {
            likelihood = 'High';
            reason = 'Last hire overdue based on average pattern';
          } else if (daysSinceLastHire >= avgGap * 0.6) {
            likelihood = 'Medium';
            reason = 'Approaching next expected hire';
          }

          return {
            ...row,
            daysSinceLastHire,
            likelihood,
            reason,
          };
        });
        setClients(parsed);
      },
    });
  };

  const exportToCSV = () => {
    const header = ['Client', 'TotalHires', 'AvgDaysBetweenHires', 'LastHireDate', 'DaysSinceLastHire', 'Likelihood', 'Reason'];
    const rows = clients.map((c) => [
      c.Client,
      c.TotalHires,
      c.AvgDaysBetweenHires,
      c.LastHireDate,
      c.daysSinceLastHire,
      c.likelihood,
      c.reason,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'client_hiring_insights.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6 flex flex-col items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">Client Hiring Insights Tool</h2>

        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full p-2 border rounded" />

        {clients.length > 0 && (
          <>
            <table className="w-full mt-6 text-sm border border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Client</th>
                  <th className="p-2 border">Total Hires</th>
                  <th className="p-2 border">Avg Gap</th>
                  <th className="p-2 border">Last Hire</th>
                  <th className="p-2 border">Days Since Last</th>
                  <th className="p-2 border">Likelihood</th>
                  <th className="p-2 border">Reason</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="p-2 border">{c.Client}</td>
                    <td className="p-2 border">{c.TotalHires}</td>
                    <td className="p-2 border">{c.AvgDaysBetweenHires}</td>
                    <td className="p-2 border">{c.LastHireDate}</td>
                    <td className="p-2 border">{c.daysSinceLastHire}</td>
                    <td className={`p-2 border font-bold ${c.likelihood === 'High' ? 'text-green-600' : c.likelihood === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{c.likelihood}</td>
                    <td className="p-2 border text-gray-600">{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={exportToCSV} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              Download Insights as CSV
            </button>
          </>
        )}
      </div>
    </div>
  );
}

