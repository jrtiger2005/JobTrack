
import {useEffect ,useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register.jsx";
import InterviewCalendar from "./InterviewCalendar.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
  Boolean(localStorage.getItem("token"))
  );
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem("token");
  setCurrentUser(null);
  setIsAuthenticated(false);
  setJobs([]);
};
  const [currentUser, setCurrentUser] = useState(null);
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
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob,setSelectedJob] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:8080/api/jobs", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
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
      console.error("Loading jobs failed:", err);
      setError("Could not load jobs. Please log in again.");
    })
    .finally(() => {
      setLoading(false);
    });
}, [isAuthenticated]);

  const counts = {
    total: jobs.length,
    applied: jobs.filter((job) => job.status === "Applied").length,
    interviews: jobs.filter((job) => job.status === "Interview").length,
    offers: jobs.filter((job) => job.status === "Offer").length,
    completed: jobs.filter((job) => job.interviewCompleted === true).length,
  };
      const rejectedCount = jobs.filter((job) => job.status === "Rejected").length;
      const responseCount =
       counts.interviews + counts.offers + counts.completed;

      const responseRate =
        counts.total === 0
       ? 0
        : Math.round((responseCount / counts.total) * 100);

      const interviewToOfferRate =
      counts.interviews + counts.offers === 0
       ? 0
      : Math.round(
        (counts.offers / (counts.interviews + counts.offers)) * 100
      );

      const statusData = [
      { name: "Applied", value: counts.applied },
      { name: "Interview", value: counts.interviews },
      { name: "Offer", value: counts.offers },
    {
      name: "Rejected",
      value: jobs.filter((job) => job.status === "Rejected").length,
    },
   ];

   const STATUS_COLORS = [
     "#6366f1",
     "#f59e0b",
     "#22c55e",
     "#ef4444",
    ];
    const monthlyData = (() => {
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    const year = date.getFullYear();
    const month = date.getMonth();

    const applications = jobs.filter((job) => {
      if (!job.appliedDate) return false;

      const appliedDate = new Date(`${job.appliedDate}T00:00:00`);

      return (
        appliedDate.getFullYear() === year &&
        appliedDate.getMonth() === month
      );
    }).length;

    months.push({
      month: date.toLocaleString("en-US", { month: "short" }),
      applications,
    });
  }

  return months;
})();


  const interviewSuccessRate =
  counts.interviews + counts.completed === 0
    ? 0
    : Math.round(
        (counts.completed /
          (counts.interviews + counts.completed)) *
          100
      );
  
const filteredJobs = jobs.filter((job) => {
  const query = search.toLowerCase().trim();

  const matchesSearch =
    job.company.toLowerCase().includes(query) ||
    job.role.toLowerCase().includes(query);

  const matchesStatus =
    statusFilter === "All" || job.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const upcomingInterviews = jobs

  .filter((job) => {
    return (
      job.interviewDate &&
      job.interviewDate >= new Date().toISOString().slice(0, 10) &&
      job.status !== "Rejected"
    );
  })
  .sort((a, b) =>
    a.interviewDate.localeCompare(b.interviewDate)
  );
    const completedInterviews = jobs.filter(
      (job) => job.interviewCompleted === true
    );

  const getDaysUntilInterview = (interviewDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const interview = new Date(`${interviewDate}T00:00:00`);

  const difference = interview - today;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};


async function completeInterview(job) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/jobs/${job.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          status: job.status,
          appliedDate: job.appliedDate,
          description: job.description,
          notes: job.notes,
          jobUrl: job.jobUrl,
          interviewDate: job.interviewDate,
          interviewTime: job.interviewTime,
          interviewRound: job.interviewRound,
          interviewCompleted: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to complete interview");
    }

    const updatedJob = await response.json();

    console.log("Updated interview:", updatedJob);

    setJobs((previousJobs) =>
      previousJobs.map((item) =>
        item.id === updatedJob.id ? updatedJob : item
      )
    );

  } catch (error) {
    console.error("Interview completion failed:", error);
    setError("Could not update interview status.");
  }
}


async function saveEditedJob(event) {
  event.preventDefault();

  if (!editingJob) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/jobs/${editingJob.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: editingJob.company,
          role: editingJob.role,
          status: editingJob.status,
          appliedDate: editingJob.appliedDate,
          description: editingJob.description,
          notes: editingJob.notes,
          jobUrl: editingJob.jobUrl,
          interviewDate: editingJob.interviewDate,
          interviewTime: editingJob.interviewTime,
          interviewRound: editingJob.interviewRound,
          interviewCompleted: editingJob.interviewCompleted,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    const updatedJob = await response.json();

    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.id === updatedJob.id ? updatedJob : job
      )
    );

    setEditingJob(null);
    setError("");

  } catch (error) {
    console.error("Updating job failed:", error);
    setError("Could not update job. Please try again.");
  }
}
   

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

if (!isAuthenticated) {
  return showRegister ? (
    <Register
      onSwitchToLogin={() => setShowRegister(false)}
    />
  ) : (
    <Login
      onLoginSuccess={(user) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  );
}
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>◈ JobTrack</h2>
        <p className="nav-active">▦ Dashboard</p>
        <p>▤ Applications</p>
        <button className="logout-button" onClick={handleLogout}>
         Logout
        </button>
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
          <Stat title="Completed Interviews" value={counts.completed} />
          <Stat title="Response Rate" value={`${responseRate}%`} />
          <Stat
            title="Interview to Offer Rate"
            value={`${interviewToOfferRate}%`}
          />
        </section>

              <section className="panel analytics-panel">
                <div className="section-heading">
                 <div>
                  <h2>Application Status</h2>
                    <p className="muted">
                      Distribution of your job applications
                       </p>
                        </div>
                           </div>

                       <div style={{ width: "100%", height: "300px" }}>
                       <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                         <Pie
                         data={statusData}
                           dataKey="value"
                           nameKey="name"
                           cx="50%"
                           cy="50%"
                           innerRadius={65}
                           outerRadius={105}
                           paddingAngle={4}
                          >
                      {statusData.map((entry, index) => (
                         <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[index]}
                          />
                            ))}
                           </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </section>
             <section className="panel analytics-panel">
                <div className="section-heading">
                 <div>
                  <h2>Monthly Application Trend</h2>
                    <p className="muted">
                      Applications submitted over the last 6 months
                      </p>
                      </div>
                         </div>

                 <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                   <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis allowDecimals={false} stroke="#9ca3af" />
                   <Tooltip />
                 <Line
                       type="monotone"
                       dataKey="applications"
                       stroke="#e2efee"
                       strokeWidth={3}
                        dot={{ r: 5 }}
                       activeDot={{ r: 7 }}
                         /> 
                   </LineChart>
                   </ResponsiveContainer>
             </div>
           </section>

        <section className="panel">
          <h2>Interview Completion Rate</h2>

          <h1>{interviewSuccessRate}%</h1>

          <div className="progress-bar">
          <div
          className="progress-fill"
          style={{ width: `${interviewSuccessRate}%` }}
          ></div>
          </div>

         <p className="muted">
         {counts.completed} of {counts.interviews + counts.completed} interviews completed
        </p>
        </section>
        <InterviewCalendar
         jobs={jobs}
         onEdit={setEditingJob}
         onDelete={deleteJob}
       />

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Add an application</h2>
              <p className="muted">Keep your job search up to date.</p>
            </div>
          </div>

 <form className="job-form add-job-form" onSubmit={addJob}>

  <div className="edit-section">
    <h3>Basic Information</h3>

    <div className="edit-grid">
      <div className="edit-field">
        <label>Company Name</label>
        <input
          placeholder="e.g. Google"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          required
        />
      </div>

      <div className="edit-field">
        <label>Job Title</label>
        <input
          placeholder="e.g. Java Developer"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
        />
      </div>
    </div>
  </div>

  <div className="edit-section">
    <h3>Application Details</h3>

    <div className="edit-field">
      <label>Job Description</label>
      <textarea
        placeholder="Describe the job responsibilities..."
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows="4"
      />
    </div>

    <div className="edit-field">
      <label>Personal Notes</label>
      <textarea
        placeholder="Add your thoughts and reminders..."
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows="3"
      />
    </div>

    <div className="edit-field">
      <label>Job Posting URL</label>
      <input
        type="url"
        placeholder="https://careers.company.com"
        value={jobUrl}
        onChange={(event) => setJobUrl(event.target.value)}
      />
    </div>
  </div>

  <div className="add-job-actions">
    <button type="submit" className="save-edit">
      + Add Job Application
    </button>
  </div>

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
         onClick={() => {
          setEditingJob({ ...job});
          setSelectedJob(null);
         }}
         >
          Edit Job
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
         <h3>Interview Details</h3>

      <p>
         <strong>Interview Date:</strong>{" "}
           {selectedJob.interviewDate || " "}
      </p>

       <p>
          <strong>Interview Time:</strong>{" "}
          {selectedJob.interviewTime || " "}
        </p>

       <p>
          <strong>Interview Round:</strong>{" "}
          {selectedJob.interviewRound || "Not selected"}
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
        
{editingJob && (
  <div className="details-overlay">
    <form
      className="details-panel edit-modal"
      onSubmit={saveEditedJob}
    >
      <button
        type="button"
        className="close-button"
        onClick={() => setEditingJob(null)}
      >
        ×
      </button>

      <div className="edit-header">
        <div className="edit-icon">✏️</div>
        <h2>Edit Job Application</h2>
        <p>Update your application information</p>
      </div>

      {/* Basic Information */}
      <div className="edit-section">
        <h3>Basic Information</h3>

        <div className="edit-grid">
          <div className="edit-field">
            <label>Company Name</label>
            <input
              value={editingJob.company}
              onChange={(event) =>
                setEditingJob({
                  ...editingJob,
                  company: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="edit-field">
            <label>Job Title</label>
            <input
              value={editingJob.role}
              onChange={(event) =>
                setEditingJob({
                  ...editingJob,
                  role: event.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <div className="edit-field">
          <label>Application Status</label>
          <select
            value={editingJob.status}
            onChange={(event) =>
              setEditingJob({
                ...editingJob,
                status: event.target.value,
              })
            }
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Application Details */}
      <div className="edit-section">
        <h3>Application Details</h3>

        <div className="edit-field">
          <label>Job Description</label>
          <textarea
            rows="4"
            value={editingJob.description || ""}
            onChange={(event) =>
              setEditingJob({
                ...editingJob,
                description: event.target.value,
              })
            }
          />
        </div>

        <div className="edit-field">
          <label>Personal Notes</label>
          <textarea
            rows="3"
            value={editingJob.notes || ""}
            onChange={(event) =>
              setEditingJob({
                ...editingJob,
                notes: event.target.value,
              })
            }
          />
        </div>

        <div className="edit-field">
          <label>Job Posting URL</label>
          <input
            type="url"
            value={editingJob.jobUrl || ""}
            onChange={(event) =>
              setEditingJob({
                ...editingJob,
                jobUrl: event.target.value,
              })
            }
            placeholder="https://careers.company.com"
          />
        </div>
      </div>

      {/* Interview Details */}
      <div className="edit-section">
        <h3>Interview Details</h3>

        <div className="edit-grid">
          <div className="edit-field">
            <label>Interview Date</label>
            <input
              type="date"
              value={editingJob.interviewDate || ""}
              onChange={(event) =>
                setEditingJob({
                  ...editingJob,
                  interviewDate: event.target.value,
                })
              }
            />
          </div>

          <div className="edit-field">
            <label>Interview Time</label>
            <input
              type="time"
              value={editingJob.interviewTime || ""}
              onChange={(event) =>
                setEditingJob({
                  ...editingJob,
                  interviewTime: event.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="edit-field">
          <label>Interview Round</label>
          <select
            value={editingJob.interviewRound || ""}
            onChange={(event) =>
              setEditingJob({
                ...editingJob,
                interviewRound: event.target.value,
              })
            }
          >
            <option value="">Select interview round</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Managerial">Managerial</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>
      </div>

      <div className="edit-actions">
        <button
          type="button"
          className="cancel-edit"
          onClick={() => setEditingJob(null)}
        >
          Cancel
        </button>

        <button type="submit" className="save-edit">
          Save Changes
        </button>
      </div>
    </form>
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
