package com.userservice.validators;



import com.userservice.models.UserDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSaveValidator {

    private final EntityManager entityManager;

    public void validateSave(
            UserDto dto) {

        // Null ve boş alan kontrolleri
      //  validateFields(dto);

        // Tekil alan (unique) kontrolü
        validateUnique(dto);
    }
/*
    private void validateFields(UserDto dto) {

        if (dto.getType() == null) {
            throw new CustomIllegalArgumentException("Kullanıcı türü boş bırakılamaz.");
        }

        if (dto.getStatus() == null) {
            throw new CustomIllegalArgumentException("Durum alanı boş bırakılamaz.");
        }

        if (StringUtils.isEmpty(dto.getUsername())) {
            throw new CustomIllegalArgumentException("Kullanıcı adı boş bırakılamaz.");
        }

        if (StringUtils.isEmpty(dto.getRoleName())) {
            throw new CustomIllegalArgumentException("Role boş bırakılamaz.");
        }

    }
*/

    private void validateUnique(UserDto dto) {

        // Dinamik sorgu oluşturma
        StringBuilder queryString = new StringBuilder(
                "SELECT COUNT(t.id) FROM UserEntity t WHERE t.username = :username"
        );

        // Güncelleme durumunda kendi kaydını dışarıda bırakma
        if (dto.getId() != null && dto.getId() > 0) {
            queryString.append(" AND t.id <> :id");
        }

        // Sorgu oluşturma
        Query query = entityManager.createQuery(queryString.toString(), Long.class);
        query.setParameter("username", dto.getUsername());

        // Eğer ID varsa onu da parametreye ekle
        if (dto.getId() != null && dto.getId() > 0) {
            query.setParameter("id", dto.getId());
        }

        // Tekil alan kontrolü
        Long count = (Long) query.getSingleResult();
        if (count > 0) {
          //  throw new CustomAlreadyExistsException("Aynı kullanıcı adına sahip bir kayıt mevcut. Farklı bir kullanıcı adı giriniz");
        }
    }
}