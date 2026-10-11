
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";

const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/attendance`, {
        auth,
        params: { page: 0, size: 100 },
      });

      const data = response.data;
      setRecords(
        Array.isArray(data) ? data : data.content || []
      );
    } catch (err) {
      console.error(
        "Attendance error:",
        err.response?.data || err.message
      );
      setError("Unable to load attendance. Check the backend endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <h2>Attendance</h2>
          <p>Review student attendance records.</p>
        </div>
        <button onClick={loadAttendance}>Refresh</button>
      </div>

      {loading && <p>Loading attendance...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <p>Total records: {records.length}</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
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
                    <td>{record.attendanceDate ?? "—"}</td>
                    <td>
                      {record.present === true
                        ? "Present"
                        : record.present === false
                        ? "Absent"
                        : "—"}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="5">No attendance records found.</td>
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

export default Attendance;
