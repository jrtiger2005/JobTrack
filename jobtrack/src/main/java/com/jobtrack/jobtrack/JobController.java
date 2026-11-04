
package com.jobtrack.jobtrack;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrack.jobtrack.model.Job;
import com.jobtrack.jobtrack.model.User;
import com.jobtrack.jobtrack.repository.JobRepository;
import com.jobtrack.jobtrack.repository.UserRepository;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class JobController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobController(JobRepository jobRepository,UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/api/jobs")
    public List<Job> getJobs(Authentication authentication) {
        String email = authentication.getName();

        return jobRepository.findByUserEmail(email);
    }

    @PostMapping("/api/jobs")
public Job addJob(
        @RequestBody Job job,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    job.setUser(user);

    return jobRepository.save(job);
}
        
    @PutMapping("/api/jobs/{id}")
public ResponseEntity<?> updateJob(
        @PathVariable Long id,
        @RequestBody Job updatedJob,
        Authentication authentication) {

    String email = authentication.getName();

    Job existingJob = jobRepository
            .findByIdAndUserEmail(id, email)
            .orElse(null);

    if (existingJob == null) {
        return ResponseEntity.notFound().build();
    }

    existingJob.setCompany(updatedJob.getCompany());
    existingJob.setRole(updatedJob.getRole());
    existingJob.setStatus(updatedJob.getStatus());
    existingJob.setAppliedDate(updatedJob.getAppliedDate());

    existingJob.setDescription(updatedJob.getDescription());
    existingJob.setNotes(updatedJob.getNotes());
    existingJob.setJobUrl(updatedJob.getJobUrl());
    existingJob.setInterviewDate(updatedJob.getInterviewDate());
    existingJob.setInterviewTime(updatedJob.getInterviewTime());
    existingJob.setInterviewRound(updatedJob.getInterviewRound());
    existingJob.setInterviewCompleted(updatedJob.isInterviewCompleted());

    return ResponseEntity.ok(jobRepository.save(existingJob));
}

   
    @DeleteMapping ("/api/jobs/{id}")
    public ResponseEntity<?> deleteJob(
        @PathVariable Long id,
        Authentication authentication) {

            String email = authentication.getName();

            Job job = jobRepository
                    .findByIdAndUserEmail(id, email)
                    .orElse(null);

            if(job == null) {
                return ResponseEntity.notFound().build();
            }

            jobRepository.delete(job);

            return ResponseEntity.ok().build();
     
        }   
 }
