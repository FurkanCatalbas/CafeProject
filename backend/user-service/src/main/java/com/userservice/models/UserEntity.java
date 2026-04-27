package com.userservice.models;

import com.wise.core.enums.UserRole;
import com.wise.core.enums.UserStatus;
import com.wise.core.models.BaseEntity;  // wise-core'dan gelecek
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USERS")
public class UserEntity extends BaseEntity implements UserDetails {

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50, nullable = false)
    private UserStatus status;

    @Column(name = "TYPE", columnDefinition = "smallint", nullable = false)
    private Integer type;

    @Column(name = "USER_NAME", length = 50 ,nullable = false)
    private String username;

    @Column(name = "PASSWORD", length = 100,nullable = false)
    private String password;

    @Column(name = "FIRST_NAME", length = 50)
    private String firstName;

    @Column(name = "LAST_NAME", length = 50)
    private String lastName;

    @Column(name = "EMAIL_ADDRESS", length = 50,nullable = false)
    private String emailAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE_NAME", length = 50 ,nullable = false)
    private UserRole roleName;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
