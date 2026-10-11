
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";

const auth = {
  username: "admin@campusconnect.com",
  password: "Admin@123",
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/courses`, {
        auth,
        params: { page: 0, size: 100 },
      });

      const data = response.data;
      setCourses(
        Array.isArray(data) ? data : data.content || []
      );
    } catch (err) {
      console.error("Courses error:", err.response?.data || err.message);
      setError("Unable to load courses. Check the backend and endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <section className="module-page">
      <div className="module-header">
        <div>
          <h2>Courses</h2>
          <p>View courses available in CampusConnect.</p>
        </div>
        <button onClick={loadCourses}>Refresh</button>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <p>Total courses: {courses.length}</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id ?? index}>
                    <td>{course.id ?? "—"}</td>
                    <td>{course.courseCode ?? "—"}</td>
                    <td>{course.courseName ?? "—"}</td>
                    <td>{course.credits ?? "—"}</td>
                    <td>{course.department ?? "—"}</td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan="5">No courses found.</td>
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

export default Courses;
