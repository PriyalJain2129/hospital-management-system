package com.hospital.service;

import com.hospital.model.Billing;
import com.hospital.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    @Autowired
    private BillingRepository billingRepository;

    public List<Billing> getAll() { return billingRepository.findAll(); }
    public Optional<Billing> getById(Integer id) { return billingRepository.findById(id); }
    public Billing save(Billing b) { return billingRepository.save(b); }
    public void delete(Integer id) { billingRepository.deleteById(id); }
}
