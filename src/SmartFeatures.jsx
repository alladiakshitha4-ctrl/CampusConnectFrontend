
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";
const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function SmartFeatures() {
  const [studentId, setStudentId] = useState("9");
  const [targetRole, setTargetRole] = useState("Java Full Stack Developer");
  const [certificateId, setCertificateId] = useState("");
  const [performance, setPerformance] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  const showError = (error) => {
    console.error("Smart feature error:", error.response?.data || error.message);
    setMessage(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Request failed. Check the endpoint, backend, and authentication."
    );
  };

  const loadPerformance = async (event) => {
    event.preventDefault();
    setLoading("performance");
    setMessage("");
    setPerformance(null);

    try {
      const response = await axios.get(
        `${API}/analytics/student/${encodeURIComponent(studentId)}`,
        { auth }
      );
      setPerformance(response.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading("");
    }
  };

  const verifyCertificate = async (event) => {
    event.preventDefault();
    setLoading("certificate");
    setMessage("");
    setCertificate(null);

    try {
      const response = await axios.get(
        `${API}/certificates/verify/${encodeURIComponent(certificateId.trim())}`
      );
      setCertificate(response.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading("");
    }
  };

  const loadPlacement = async (event) => {
    event.preventDefault();
    setLoading("placement");
    setMessage("");
    setPlacement(null);

    try {
      const response = await axios.get(
        `${API}/placement/readiness/${encodeURIComponent(studentId)}`,
        {
          auth,
          params: { targetRole },
        }
      );
      setPlacement(response.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading("");
    }
  };

  const panelStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 18,
    boxShadow: "0 3px 12px rgba(20,40,80,0.06)",
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 10,
    margin: "8px 0 14px",
  };

  return (
    <section className="module-page">
      <h2>✨ Smart Features</h2>
      <p>Tools to support academic performance and career readiness.</p>

      {message && <p className="error-message">{message}</p>}

      <article style={panelStyle}>
        <h3>📊 Performance Analytics</h3>
        <form onSubmit={loadPerformance}>
          <label>Student ID</label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <button type="submit" disabled={loading !== ""}>
            {loading === "performance" ? "Loading..." : "Check Performance"}
          </button>
        </form>

        {performance && (
          <div>
            <p><strong>Student:</strong> {performance.studentName}</p>
            <p><strong>Marks:</strong> {performance.marksPercentage}%</p>
            <p><strong>Attendance:</strong> {performance.attendancePercentage}%</p>
            <p><strong>Overall score:</strong> {performance.overallScore}</p>
            <p><strong>Performance:</strong> {performance.performanceLevel}</p>
            <p><strong>Risk level:</strong> {performance.riskLevel}</p>
          </div>
        )}
      </article>

      <article style={panelStyle}>
        <h3>🎓 Digital Certificate Verification</h3>
        <form onSubmit={verifyCertificate}>
          <label>Certificate ID</label>
          <input
            style={inputStyle}
            required
            placeholder="Example: CC-BA9EB5BB"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
          />
          <button type="submit" disabled={loading !== ""}>
            {loading === "certificate" ? "Verifying..." : "Verify Certificate"}
          </button>
        </form>

        {certificate && (
          <div>
            <p><strong>Result:</strong> {certificate.status}</p>
            <p><strong>Certificate ID:</strong> {certificate.certificateId}</p>
            <p><strong>Student:</strong> {certificate.studentName}</p>
            <p><strong>Course:</strong> {certificate.courseName}</p>
            <p><strong>Issue date:</strong> {certificate.issueDate}</p>
          </div>
        )}
      </article>

      <article style={panelStyle}>
        <h3>💼 Placement Readiness</h3>
        <form onSubmit={loadPlacement}>
          <label>Student ID</label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <label>Target role</label>
          <select
            style={inputStyle}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <option>Java Full Stack Developer</option>
            <option>Data Analyst</option>
            <option>Frontend Developer</option>
          </select>

          <button type="submit" disabled={loading !== ""}>
            {loading === "placement" ? "Calculating..." : "Check Readiness"}
          </button>
        </form>

        {placement && (
          <div>
            <h3>Readiness: {placement.readinessPercentage}%</h3>
            <p><strong>Target role:</strong> {placement.targetRole}</p>
            <p><strong>Matched skills:</strong> {placement.matchedSkills?.join(", ") || "None"}</p>
            <p><strong>Skills to learn:</strong> {placement.missingSkills?.join(", ") || "None"}</p>
            <p>{placement.recommendation}</p>
          </div>
        )}
      </article>
    </section>
  );
}

export default SmartFeatures;
