package com.wise.core.models;

import com.wise.core.enums.RecordStatusType;
import org.apache.commons.lang3.ObjectUtils;
import java.time.LocalDateTime;

public class DefaultValueSetterBaseDto {

    private DefaultValueSetterBaseDto() {}

    public static <T extends BaseDto> T setDefaultValue(T dto, RecordStatusType recordStatusType, Integer userId) {
        switch (recordStatusType) {
            case CREATE -> setNewRecordValues(dto, userId);
            case UPDATE -> setEditRecordValues(dto, userId);
            default -> {}
        }
        return dto;
    }

    private static <T extends BaseDto> void setNewRecordValues(T dto, Integer userId) {
        dto.setUpdateseq(0);
        dto.setCreateDate(LocalDateTime.now());
        dto.setCreateFkUser(userId);
    }

    private static <T extends BaseDto> void setEditRecordValues(T dto, Integer userId) {
        dto.setModifiedDate(LocalDateTime.now());
        dto.setModifiedFkUser(userId);
        int updateSeq = ObjectUtils.isEmpty(dto.getUpdateseq()) ? 0 : dto.getUpdateseq();
        if (updateSeq >= 32700) updateSeq = 0;
        dto.setUpdateseq(updateSeq + 1);
    }
}