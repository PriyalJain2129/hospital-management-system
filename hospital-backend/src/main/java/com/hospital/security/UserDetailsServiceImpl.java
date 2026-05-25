package com.hospital.security;

import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .map(u -> new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), new ArrayList<>()))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
