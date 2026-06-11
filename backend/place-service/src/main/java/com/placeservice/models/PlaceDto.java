package com.placeservice.models;

import com.wise.core.enums.PlaceStatus;
import com.wise.core.models.BaseDto;
import lombok.Data;

import java.io.Serializable;

@Data
public class PlaceDto extends BaseDto implements Serializable {
    private PlaceStatus status;
    private String name;
    private Integer managerId;
    private String qrCode;
}
