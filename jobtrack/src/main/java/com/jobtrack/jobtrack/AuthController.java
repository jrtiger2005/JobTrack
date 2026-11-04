package com.jobtrack.jobtrack;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrack.jobtrack.model.User;
import com.jobtrack.jobtrack.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.name() == null || request.name().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().length() < 8) {
            return ResponseEntity.badRequest()
                    .body("Enter a name, valid email and password of at least 8 characters.");
        }

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already registered.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail()
                ));
        }
             @PostMapping("/login")
         public ResponseEntity<?> login(@RequestBody LoginRequest request) {

         String email = request.email().trim().toLowerCase();

         User user = userRepository.findByEmail(email).orElse(null);

         if (user == null ||
                !passwordEncoder.matches(
                        request.password(), user.getPassword())) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body("Invalid email or password.");
         }

          String token = jwtService.generateToken(user.getEmail());

             return ResponseEntity.ok(
                   new LoginResponse(
                       user.getId(),
                       user.getName(),
                       user.getEmail(),
                       token
                )
          );
        }

    public record RegisterRequest(
            String name,
            String email,
            String password) {
    }

    public record LoginRequest(
            String email,
            String password) {
    }


    public record AuthResponse(
            Long id,
            String name,
            String email) {
    }

    public record LoginResponse(
            Long id,
            String name,
            String email,
            String token) {
    }
}