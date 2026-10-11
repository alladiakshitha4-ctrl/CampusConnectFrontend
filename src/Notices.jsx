
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";
const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Notices() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    publishedDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    targetAudience: "ALL",
    active: true,
  });

  const loadNotices = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(`${API}/notices`, { auth });
      const data = response.data;
      setNotices(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error("Notices error:", error.response?.data || error.message);
      setMessage("Unable to load notices. Check the backend and /notices endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const addNotice = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/notices`, form, { auth });
      setMessage("Notice added successfully.");
      setShowForm(false);
      setForm({
        title: "",
        content: "",
        category: "GENERAL",
        publishedDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        targetAudience: "ALL",
        active: true,
      });
      await loadNotices();
    } catch (error) {
      console.error("Add notice error:", error.response?.data || error.message);
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to add notice. Check the required fields and backend validation."
      );
    }
  };

  const filteredNotices = notices.filter((notice) =>
    `${notice.title || ""} ${notice.content || ""} ${notice.category || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <h2>📢 Notices</h2>
          <p>Campus announcements and important updates.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={loadNotices}>Refresh</button>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Notice"}
          </button>
        </div>
      </div>

      {message && <p>{message}</p>}

      {showForm && (
        <form onSubmit={addNotice} className="notice-form">
          <label>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label>Content</label>
          <textarea
            required
            rows="4"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="GENERAL">General</option>
            <option value="ACADEMIC">Academic</option>
            <option value="EVENT">Event</option>
            <option value="EXAM">Exam</option>
            <option value="PLACEMENT">Placement</option>
          </select>

          <label>Published date</label>
          <input
            type="date"
            required
            value={form.publishedDate}
            onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
          />

          <label>Expiry date (optional)</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />

          <label>Target audience</label>
          <select
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
          >
            <option value="ALL">All</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            {" "}Active notice
          </label>

          <button type="submit">Save Notice</button>
        </form>
      )}

      <input
        type="search"
        placeholder="Search notices by title, content, or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", margin: "12px 0" }}
      />

      {loading && <p>Loading notices...</p>}

      {!loading && (
        <div className="notice-list">
          {filteredNotices.map((notice) => (
            <article
              key={notice.id}
              className="panel"
              style={{ marginBottom: 12 }}
            >
              <h3>{notice.title}</h3>
              <p>{notice.content}</p>
              <p>
                <strong>Category:</strong> {notice.category || "General"}
                {" · "}
                <strong>Published:</strong> {notice.publishedDate || "—"}
              </p>
              <p>
                <strong>Audience:</strong> {notice.targetAudience || "All"}
                {" · "}
                <strong>Status:</strong> {notice.active ? "Active" : "Inactive"}
              </p>
              {notice.expiryDate && (
                <p><strong>Expires:</strong> {notice.expiryDate}</p>
              )}
            </article>
          ))}

          {filteredNotices.length === 0 && (
            <p>No matching notices found.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default Notices;
