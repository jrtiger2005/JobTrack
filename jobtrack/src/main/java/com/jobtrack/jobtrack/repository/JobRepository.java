package com.jobtrack.jobtrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobtrack.jobtrack.model.Job;

public interface JobRepository extends JpaRepository<Job, Long> {
    
}
