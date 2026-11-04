package com.jobtrack.jobtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobtrack.jobtrack.model.Job;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByUserEmail(String email);

    Optional<Job> findByIdAndUserEmail(Long id, String email);

    boolean existsByIdAndUserEmail(Long id, String email);
}