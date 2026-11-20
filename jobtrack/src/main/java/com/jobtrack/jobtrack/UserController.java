
package com.jobtrack.jobtrack;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrack.jobtrack.model.User;
import com.jobtrack.jobtrack.repository.UserRepository;
@RestController
@RequestMapping("/api/users")
public class UserController {

      private final UserRepository userRepository;
         private final PasswordEncoder passwordEncoder;

      public UserController(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder) {
       this.userRepository = userRepository;
       this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new ProfileResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )
        );
    }
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
        @RequestBody UpdateProfileRequest request,
        Authentication authentication) {

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElse(null);

    if (user == null) {
        return ResponseEntity.notFound().build();
    }

    if (request.name() == null || request.name().isBlank()) {
        return ResponseEntity.badRequest()
                .body("Name cannot be empty");
    }

    user.setName(request.name().trim());

    User updatedUser = userRepository.save(user);

    return ResponseEntity.ok(
            new ProfileResponse(
                    updatedUser.getId(),
                    updatedUser.getName(),
                    updatedUser.getEmail()
            )
    );
}

@PutMapping("/change-password")
public ResponseEntity<?> changePassword(
        @RequestBody ChangePasswordRequest request,
        Authentication authentication) {

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElse(null);

    if (user == null) {
        return ResponseEntity.notFound().build();
    }

    if (request.currentPassword() == null ||
            !passwordEncoder.matches(
                    request.currentPassword(), user.getPassword())) {
        return ResponseEntity.badRequest()
                .body("Current password is incorrect");
    }

    if (request.newPassword() == null ||
            request.newPassword().length() < 8) {
        return ResponseEntity.badRequest()
                .body("New password must be at least 8 characters");
    }

    user.setPassword(
            passwordEncoder.encode(request.newPassword())
    );

    userRepository.save(user);

    return ResponseEntity.ok("Password changed successfully");
   }

   public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
   )  {}

public record UpdateProfileRequest(String name) {}

    public record ProfileResponse(
            Long id,
            String name,
            String email
    ) {}
}
