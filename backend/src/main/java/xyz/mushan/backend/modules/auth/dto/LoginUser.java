package xyz.mushan.backend.modules.auth.dto;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * @author mushan
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoginUser implements UserDetails {

    private Long userId;
    private String username;
    private String password;
    private String roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }
}
