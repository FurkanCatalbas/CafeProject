package com.userservice.models;


import com.userservice.enums.RecordStatusType;
import com.wise.core.models.BaseDto;
import org.apache.commons.lang3.ObjectUtils;

import java.time.LocalDateTime;

public class DefaultValueSetterBaseDto {

    private DefaultValueSetterBaseDto() {
    }

    /**
     * BaseDto'dan türetilen herhangi bir DTO nesnesine varsayılan değerler atar.
     *
     * @param <T>              BaseDto'dan türetilen herhangi bir DTO tipi
     * @param dto              Varsayılan değerlerin atanacağı DTO nesnesi
     * @param recordStatusType Kaydın durumunu belirten RecordStatusType enum değeri
     * @return Varsayılan değerleri atanmış DTO nesnesi
     */
    public static <T extends BaseDto> T setDefaultValue(T dto, RecordStatusType recordStatusType, Integer userId) {

        if(userId==null) {
           /* AuthenticateUserDto authUser = CommonAuthenticationUtils.getAuthenticatedInfo();
            userId=authUser.getUserObjectDto().getUserId(); */
        }

        switch (recordStatusType) {
            case CREATE:
                setNewRecordValues(dto, userId);
                break;
            case UPDATE:
                setEditRecordValues(dto, userId);
                break;
            default:
                break;
        }

        return dto;
    }

    private static <T extends BaseDto> void setNewRecordValues(T dto, Integer userId) {
        dto.setUpdateseq(0);
        dto.setCreateDate(LocalDateTime.now());
     //   dto.setUuid(UUID());
        dto.setCreateFkUser(userId);
    }

    private static <T extends BaseDto> void setEditRecordValues(T dto, Integer userId) {
        dto.setModifiedDate(LocalDateTime.now());
        dto.setModifiedFkUser(userId);

        int updateSeq = ObjectUtils.isEmpty(dto.getUpdateseq()) ? 0 : dto.getUpdateseq();

        // SQL Server'da SMALLINT veri türünün maksimum değeri 32767'dir.
        // Bu nedenle, updateseq değeri 32000'ten büyük olursa,
        // updateseq değeri 1 olarak sıfırlanır ve bir sonraki güncellemede
        // tekrar artırılmaya başlanır.
        if (updateSeq >= 32700)
            updateSeq = 0;

        dto.setUpdateseq(updateSeq + 1);
    } }