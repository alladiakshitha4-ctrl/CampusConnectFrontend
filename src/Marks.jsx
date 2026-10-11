
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";

const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Marks() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMarks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/marks`, {
        auth,
        params: { page: 0, size: 100 },
      });

      const data = response.data;
      setRecords(
        Array.isArray(data) ? data : data.content || []
      );
    } catch (err) {
      console.error("Marks error:", err.response?.data || err.message);
      setError("Unable to load marks. Check the backend endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, []);

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <h2>Marks</h2>
          <p>View student examination results.</p>
        </div>
        <button onClick={loadMarks}>Refresh</button>
      </div>

      {loading && <p>Loading marks...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <p>Total mark records: {records.length}</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Exam Type</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const obtained = Number(record.marksObtained);
                  const total = Number(record.totalMarks);
                  const percentage =
                    Number.isFinite(obtained) &&
                    Number.isFinite(total) &&
                    total > 0
                      ? `${((obtained / total) * 100).toFixed(1)}%`
                      : "—";

                  return (
                    <tr key={record.id ?? index}>
                      <td>{record.id ?? "—"}</td>
                      <td>
                        {record.student?.name ??
                          record.studentName ??
                          record.studentId ??
                          "—"}
                      </td>
                      <td>
                        {record.course?.courseName ??
                          record.courseName ??
                          record.courseId ??
                          "—"}
                      </td>
                      <td>{record.examType ?? "—"}</td>
                      <td>{record.marksObtained ?? "—"}</td>
                      <td>{record.totalMarks ?? "—"}</td>
                      <td>{percentage}</td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="7">No marks records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default Marks;
