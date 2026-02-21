package com.userservice.repository;

import com.userservice.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUsername(String userName);

}