package com.userservice.controllers;

import com.userservice.services.UserFavoriteService;
import com.wise.core.models.QueryResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/favorites")
@RequiredArgsConstructor
public class UserFavoriteController {

    private final UserFavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<QueryResponses<Integer>> getFavorites(@RequestHeader("X-User-Id") Integer userId) {
        List<Integer> favorites = favoriteService.getFavoriteProductIds(userId);
        QueryResponses<Integer> response = new QueryResponses<>();
        response.setData(favorites);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(
            @RequestHeader("X-User-Id") Integer userId,
            @PathVariable Integer productId) {
        favoriteService.addFavorite(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(
            @RequestHeader("X-User-Id") Integer userId,
            @PathVariable Integer productId) {
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.ok().build();
    }
}
