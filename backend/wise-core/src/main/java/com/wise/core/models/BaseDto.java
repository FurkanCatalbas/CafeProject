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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public Integer getCreateFkUser() {
        return createFkUser;
    }

    public void setCreateFkUser(Integer createFkUser) {
        this.createFkUser = createFkUser;
    }

    public LocalDateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public Integer getModifiedFkUser() {
        return modifiedFkUser;
    }

    public void setModifiedFkUser(Integer modifiedFkUser) {
        this.modifiedFkUser = modifiedFkUser;
    }

    public Integer getUpdateseq() {
        return updateseq;
    }

    public void setUpdateseq(Integer updateseq) {
        this.updateseq = updateseq;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}