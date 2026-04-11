package com.placeservice.models;

import com.wise.core.models.BaseDto;
import lombok.Data;

import java.io.Serializable;

@Data
public class PlaceDto extends BaseDto implements Serializable {
    private Integer status;

    private Integer managerId;

    private String name;
}
