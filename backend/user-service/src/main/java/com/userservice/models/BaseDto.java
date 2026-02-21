package com.userservice.models;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
    public abstract class BaseDto extends CoreDto {

        private Integer id;
        private LocalDateTime createDate;
        private Integer createFkUser;
        private LocalDateTime modifiedDate;
        private Integer modifiedFkUser;
        private Integer updateseq;
        private String uuid;

    }


