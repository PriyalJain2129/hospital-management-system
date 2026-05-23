package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() { return doctorRepository.findAll(); }
    public Optional<Doctor> getDoctorById(Integer id) { return doctorRepository.findById(id); }
    public Doctor saveDoctor(Doctor doctor) { return doctorRepository.save(doctor); }
    public void deleteDoctor(Integer id) { doctorRepository.deleteById(id); }
}
