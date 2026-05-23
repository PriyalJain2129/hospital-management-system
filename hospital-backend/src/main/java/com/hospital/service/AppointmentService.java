package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAll() { return appointmentRepository.findAll(); }
    public Optional<Appointment> getById(Integer id) { return appointmentRepository.findById(id); }
    public Appointment save(Appointment a) { return appointmentRepository.save(a); }
    public void delete(Integer id) { appointmentRepository.deleteById(id); }
}
