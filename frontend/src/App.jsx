
import {useEffect ,useState } from "react";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [description,setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [selectedJob,setSelectedJob] = useState(null);

  useEffect(() => {
  fetch("http://localhost:8080/api/jobs")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load jobs");
      }
      return response.json();
    })
    .then((data) => {
      setJobs(data);
      setError("");
    })
    .catch((err) => {
      console.error("Loading jobs failed:",err);
      setError("Could not load jobs.check that Spring Boot is running.");
    })
    .finally(() => {
      setLoading(false);
    })
}, []);

  const counts = {
    total: jobs.length,
    applied: jobs.filter((job) => job.status === "Applied").length,
    interviews: jobs.filter((job) => job.status === "Interview").length,
    offers: jobs.filter((job) => job.status === "Offer").length,
  };

  const filteredJobs = jobs.filter((job) => {
  const query = search.toLowerCase().trim();

  const matchesSearch =
    job.company.toLowerCase().includes(query) ||
    job.role.toLowerCase().includes(query);

  const matchesStatus =
    statusFilter === "All" || job.status === statusFilter;

  return matchesSearch && matchesStatus;
});

    

async function addJob(event) {
  event.preventDefault();

  if (!company.trim() || !role.trim()) return;

  try {
    console.log("Description being sent:", description);

    const response = await fetch("http://localhost:8080/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: company.trim(),
        role: role.trim(),
        status: "Applied",
        appliedDate: new Date().toISOString().slice(0, 10),
        description: description,
        notes: notes,
        jobUrl: jobUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add job");
    }

    const savedJob = await response.json();

    setJobs((previousJobs) => [...previousJobs, savedJob]);

    setCompany("");
    setRole("");
    setDescription("");
    setNotes("");
    setJobUrl("");
    setError("");

  } catch (error) {
    console.error("Adding job failed:", error);
    setError("Could not add job. Please try again.");
  }
}


     
async function updateStatus(id, status) {
  const job = jobs.find((item) => item.id === id);

  if (!job) return;

  try {
    const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: job.company,
        role: job.role,
        status,
        appliedDate: job.appliedDate,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    const updatedJob = await response.json();

    setJobs((currentJobs) =>
      currentJobs.map((item) => (item.id === id ? updatedJob : item))
    );
    setError("");
  } catch (err) {
    console.error("Updating job failed:", err);
    setError("Could not update status. Please try again.");
  }
}

    
async function deleteJob(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }

    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
    setError("");
  } catch (err) {
    console.error("Deleting job failed:", err);
    setError("Could not delete job. Please try again.");
  }
}

 
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>◈ JobTrack</h2>
        <p className="nav-active">▦ Dashboard</p>
        <p>▤ Applications</p>
        <div className="sidebar-bottom">Your career, organized.</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="muted">Track every opportunity in one place.</p>
          </div>
          <span className="avatar">JT</span>
        </header>

        <section className="stats">
          <Stat title="Total applications" value={counts.total} />
          <Stat title="Applied" value={counts.applied} />
          <Stat title="Interviews" value={counts.interviews} />
          <Stat title="Offers" value={counts.offers} />
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Add an application</h2>
              <p className="muted">Keep your job search up to date.</p>
            </div>
          </div>

           
<form className="job-form" onSubmit={addJob}>
  <input
    placeholder="Company name"
    value={company}
    onChange={(event) => setCompany(event.target.value)}
    required
  />

  <input
    placeholder="Job title"
    value={role}
    onChange={(event) => setRole(event.target.value)}
    required
  />

  <textarea
    placeholder="Job description"
    value={description}
    onChange={(event) => setDescription(event.target.value)}
    rows="3"
  />

  <textarea
    placeholder="Personal notes"
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
    rows="3"
  />

  <input
    type="url"
    placeholder="Job posting URL (https://...)"
    value={jobUrl}
    onChange={(event) => setJobUrl(event.target.value)}
  />

  <button type="submit">+ Add job</button>
</form>

        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Your applications</h2>
              <p className="muted">Review and manage your opportunities.</p>
            </div>
            <span className="count">{jobs.length} jobs</span>
          </div>
            
          <div className="filters">
            <input
            type="text"
            placeholder="Search company or role..."
            value={search}
             onChange={(event) => setSearch(event.target.value)}
           />

         <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
       >
          <option value="All">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          </select>
           </div>



          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>COMPANY / ROLE</th>
                  <th>DESCRIPTION</th>
                  <th>DATE APPLIED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              
               
<tbody>
  {loading && (
    <tr>
      <td colSpan="5">Loading applications...</td>
    </tr>
  )}

  {error && (
    <tr>
      <td colSpan="5">{error}</td>
    </tr>
  )}

  {filteredJobs.map((job) => (
    <tr key={job.id}>
      <td>
        <strong>{job.company}</strong>
        <span className="role">{job.role}</span>
        <button
         className="view-button"
         onClick={() => setSelectedJob(job)}
         >
          View Details
         </button>
      </td>

      <td>
        {job.description || "No description"}
      </td>

      <td>{job.appliedDate}</td>

      <td>
        <select
          className={`status status-${job.status.toLowerCase()}`}
          value={job.status}
          onChange={(event) =>
            updateStatus(job.id, event.target.value)
          }
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </td>

      <td>
        <button
          className="delete-button"
          onClick={() => deleteJob(job.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}

  {!loading && !error && filteredJobs.length === 0 && (
    <tr>
      <td colSpan="5" className="empty">
        No matching applications found.
      </td>
    </tr>
  )}
</tbody>


            </table>
          </div>
        </section>
        <footer>JobTrack · Built to keep your career moving.</footer>
        
{selectedJob && (
  <div className="details-overlay">
    <div className="details-panel">
      <button
        className="close-button"
        onClick={() => setSelectedJob(null)}
      >
        ✕
      </button>

      <h2>{selectedJob.company}</h2>
      <h3>{selectedJob.role}</h3>

      <p>
        <strong>Status:</strong> {selectedJob.status}
      </p>

      <p>
        <strong>Applied Date:</strong> {selectedJob.appliedDate}
      </p>

      <h3>Job Description</h3>
      <p>{selectedJob.description || "No description added."}</p>

      <h3>Personal Notes</h3>
      <p>{selectedJob.notes || "No notes added."}</p>

      <h3>Job Posting</h3>
      {selectedJob.jobUrl ? (
        <a href={selectedJob.jobUrl} target="_blank" rel="noreferrer">
          Open Job Posting
        </a>
      ) : (
        <p>No job URL added.</p>
      )}
    </div>
  </div>
)}

      </main>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
