package com.authservice.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.authservice.models.enums.RoleType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USERS")
public class UserEntity implements UserDetails{
    @Id
    @Column(name = "ID", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO ??
    private Integer id;

    @Column(name = "TYPE", columnDefinition = "smallint", nullable = true)
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

    @Enumerated(EnumType.STRING) // Veritabanına "ADMIN", "MUSTERI" gibi yazması için (Okunabilirlik sağlar)
    @Column(name = "ROLE_NAME", length = 20)
    private RoleType role;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // RoleType null değilse adını döndürür
        return List.of(new SimpleGrantedAuthority(role.name()));
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
