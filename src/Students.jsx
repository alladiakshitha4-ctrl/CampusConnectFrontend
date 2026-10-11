
import { useEffect, useState } from "react";

import axios from "axios";

const API = "http://localhost:8080";
const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/students`, { auth });
      const data = response.data;

      // Supports either a normal list or a Spring Page response.
      setStudents(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Students error:", err.response?.data || err.message);
      setError(
        `Could not load students (${err.response?.status || "connection error"}).`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <section style={{ padding: "24px" }}>
      <h2>Student Management</h2>
      <p>View students registered in CampusConnect.</p>

      <button onClick={loadStudents} disabled={loading}>
        {loading ? "Loading..." : "Refresh Students"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading && <p>Loading student records...</p>}

      {!loading && !error && (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
            }}
          >
            <thead>
              <tr>
                {["ID", "Name", "Email", "Phone", "Department"].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {student.id}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {student.name}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {student.email}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {student.phone || "—"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {student.department || "—"}
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "16px" }}>
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Students;