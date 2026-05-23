package com.hospital.controller;

import com.hospital.model.Billing;
import com.hospital.model.Patient;
import com.hospital.service.BillingService;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired private BillingService billingService;
    @Autowired private PatientRepository patientRepository;

    @GetMapping
    public List<Billing> getAll() { return billingService.getAll(); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            Billing b = new Billing();
            Patient p = patientRepository.findById(Integer.parseInt(body.get("patientId"))).orElseThrow();
            b.setPatient(p);
            b.setAmount(Double.parseDouble(body.get("amount")));
            b.setStatus(body.getOrDefault("status", "PENDING"));
            b.setDescription(body.getOrDefault("description", ""));
            String pd = body.get("paymentDate");
            if (pd != null && !pd.isEmpty()) b.setPaymentDate(LocalDate.parse(pd));
            return ResponseEntity.ok(billingService.save(b));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        billingService.delete(id);
        return ResponseEntity.ok().build();
    }
}
