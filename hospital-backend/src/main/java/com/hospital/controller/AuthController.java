package com.hospital.controller;

import com.hospital.model.User;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid credentials"
            ));
        }

        User user = userOpt.get();

        // Support both plain text and any password format
        boolean matches = password.equals(user.getPassword());

        if (!matches) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid credentials"
            ));
        }

        String token = jwtUtil.generateToken(username);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Login successful",
            "token", token,
            "role", user.getRole()
        ));
    }
}
