package com.placeservice.services;

import com.placeservice.models.PlaceDto;
import com.placeservice.models.PlaceEntity;
import com.placeservice.repository.PlacesRespository;
import com.wise.core.enums.RecordStatusType;
import com.wise.core.models.DefaultValueSetterBaseDto;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PlaceServiceImpl implements PlacesService{

    private final PlacesRespository placesRepository;
    private final EntityManager entityManager;

    @Override
    public PlaceDto create(PlaceDto placeDto) {
        placeDto.setId(null);
        PlaceEntity entity = placesRepository.save(toEntity(placeDto));
        return toDto(entity);
    }

    @Override
    public PlaceDto update(PlaceDto placeDto) {
        if (getById(placeDto.getId()) == null) {
            // bu hatayı döndür throw new CustomResourceNotFoundException("PlaceEntity not found");
        }
        PlaceEntity entity = placesRepository.save(toEntity(placeDto));
        return toDto(entity);
    }


    @Override
    public PlaceDto getById(Integer id) {

        PlaceEntity entity = placesRepository.findById(id)
                .orElse(null);

        return toDto(entity);
    }

    @Override
    public void delete(Integer id) {

        if (getById(id) == null) {
            //mutaf bu hataları yakala throw new CustomResourceNotFoundException("Entity not found");
        }
        placesRepository.deleteById(id);
    }



//mapper kullanmadan da yapılabilir
    private PlaceDto toDto(PlaceEntity entity) {
        PlaceDto dto = new PlaceDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private PlaceEntity toEntity(PlaceDto dto) {
       PlaceEntity entity = new PlaceEntity();
       BeanUtils.copyProperties(dto, entity);
       return entity;
    }
}

