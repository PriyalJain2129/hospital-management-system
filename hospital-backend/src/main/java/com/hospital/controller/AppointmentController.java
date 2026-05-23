package com.hospital.controller;

import com.hospital.model.Appointment;
import com.hospital.model.Patient;
import com.hospital.model.Doctor;
import com.hospital.service.AppointmentService;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired private AppointmentService appointmentService;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;

    @GetMapping
    public List<Appointment> getAll() { return appointmentService.getAll(); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            Appointment a = new Appointment();
            Patient p = patientRepository.findById(Integer.parseInt(body.get("patientId"))).orElseThrow();
            Doctor d = doctorRepository.findById(Integer.parseInt(body.get("doctorId"))).orElseThrow();
            a.setPatient(p);
            a.setDoctor(d);
            a.setAppointmentDate(LocalDate.parse(body.get("appointmentDate")));
            a.setAppointmentTime(LocalTime.parse(body.get("appointmentTime")));
            a.setStatus(body.getOrDefault("status", "SCHEDULED"));
            a.setNotes(body.getOrDefault("notes", ""));
            return ResponseEntity.ok(appointmentService.save(a));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        appointmentService.delete(id);
        return ResponseEntity.ok().build();
    }
}
