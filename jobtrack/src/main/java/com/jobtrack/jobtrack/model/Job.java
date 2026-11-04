
package com.jobtrack.jobtrack.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private String company;
    private String role;
    private String status;
    private LocalDate appliedDate;
    private String description;
    private String notes;
    private String jobUrl;
    private LocalDate interviewDate;
    private String interviewTime;
    private String interviewRound;
    private boolean interviewCompleted = false;


    public Job() {
    }

    public Job(Long id, String company, String role,
               String status, LocalDate appliedDate) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.status = status;
        this.appliedDate = appliedDate;
        
    }

    public Long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public String getNotes(){
        return notes;
    }

    public void setNotes(String notes){
        this.notes = notes;
    }

    public String getJobUrl(){
        return jobUrl;
    }

    public void setJobUrl(String jobUrl){
        this.jobUrl = jobUrl;
    }

    public LocalDate getInterviewDate(){
        return interviewDate;
    }

    public void setInterviewDate(LocalDate interviewDate){
        this.interviewDate = interviewDate;   
    }

    public String getInterviewTime(){
        return interviewTime;        
    }

    public void setInterviewTime(String interviewTime) {
    this.interviewTime = interviewTime;
    }

    public String getInterviewRound() {
    return interviewRound;

    }

    public void setInterviewRound(String interviewRound) {
    this.interviewRound = interviewRound;
    
    }

    public boolean isInterviewCompleted() {
        return interviewCompleted;
    }

    public  void setInterviewCompleted(boolean interviewCompleted) {
        this.interviewCompleted = interviewCompleted;
    }
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
