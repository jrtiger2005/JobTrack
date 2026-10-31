
package com.jobtrack.jobtrack;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrack.jobtrack.model.Job;
import com.jobtrack.jobtrack.repository.JobRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping("/api/jobs")
    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    @PostMapping("/api/jobs")
    public Job addJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }
        
@PutMapping("/api/jobs/{id}")
public Job updateJob(
        @PathVariable Long id,
        @RequestBody Job updatedJob) {

    Job existingJob = jobRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Job not found: " + id));

    existingJob.setCompany(updatedJob.getCompany());
    existingJob.setRole(updatedJob.getRole());
    existingJob.setStatus(updatedJob.getStatus());
    existingJob.setAppliedDate(updatedJob.getAppliedDate());

    existingJob.setDescription(updatedJob.getDescription());
    existingJob.setNotes(updatedJob.getNotes());
    existingJob.setJobUrl(updatedJob.getJobUrl());

    return jobRepository.save(existingJob);
}

   
    @DeleteMapping("/api/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        if(!jobRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }

        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
     
}
