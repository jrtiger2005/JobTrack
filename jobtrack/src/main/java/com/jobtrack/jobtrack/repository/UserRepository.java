package com.jobtrack.jobtrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobtrack.jobtrack.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
