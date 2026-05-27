package com.userservice.services;

import com.userservice.models.UserFavoriteEntity;
import com.userservice.repository.UserFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserFavoriteService {

    private final UserFavoriteRepository favoriteRepository;

    public List<Integer> getFavoriteProductIds(Integer userId) {
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(UserFavoriteEntity::getProductId)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Integer userId, Integer productId) {
        if (favoriteRepository.findByUserIdAndProductId(userId, productId).isEmpty()) {
            UserFavoriteEntity favorite = new UserFavoriteEntity();
            favorite.setUserId(userId);
            favorite.setProductId(productId);
            favorite.setCreatedDate(LocalDateTime.now());
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Integer userId, Integer productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
