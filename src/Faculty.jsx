import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";

const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFaculty = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/faculty`, {
        auth,
        params: { page: 0, size: 100 },
      });

      const data = response.data;
      setFaculty(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Faculty error:", err.response?.data || err.message);
      setError(
        `Unable to load faculty (${err.response?.status || "connection error"}).`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  return (
    <section style={{ padding: "24px" }}>
      <h2>Faculty Management</h2>
      <p>View faculty members registered in CampusConnect.</p>

      <button onClick={loadFaculty} disabled={loading}>
        {loading ? "Loading..." : "Refresh Faculty"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading faculty records...</p>}

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
                {["ID", "Name", "Email", "Department", "Designation", "Employee ID"].map(
                  (heading) => (
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
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {faculty.map((member) => (
                <tr key={member.id}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.id}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.name}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.email}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.department || "—"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.designation || "—"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {member.employeeId || "—"}
                  </td>
                </tr>
              ))}

              {faculty.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "16px" }}>
                    No faculty records found.
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

export default Faculty;