import React, { useState } from "react";

function InterviewCalendar({ jobs }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const interviews = jobs.filter(
    (job) => job.interviewDate && job.status !== "Rejected"
  );

  const getInterviewsForDay = (day) => {
    const date = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return interviews.filter((job) => job.interviewDate === date);
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  return (
    <section className="panel interview-calendar">
      <div className="calendar-header">
        <h2>Interview Calendar</h2>

        <div>
          <button onClick={() => changeMonth(-1)}>←</button>
          <strong>{monthName}</strong>
          <button onClick={() => changeMonth(1)}>→</button>
        </div>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="calendar-day-name" key={day}>
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }, (_, index) => (
          <div className="calendar-cell empty" key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayInterviews = getInterviewsForDay(day);

          return (
            <div className="calendar-cell" key={day}>
              <span>{day}</span>

              {dayInterviews.map((job) => (
                <div className="calendar-event" key={job.id}>
                  {job.company}
                  <small>{job.interviewTime || "Time not set"}</small>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default InterviewCalendar;