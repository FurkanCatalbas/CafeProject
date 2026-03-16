package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

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