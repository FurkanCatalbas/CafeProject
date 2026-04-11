package com.wise.core.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@DynamicUpdate
@DynamicInsert
public abstract class BaseEntity implements Cloneable, Serializable {

    @Id
    @Column(name = "ID", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    //uuid kullanılan sql e göre farklılık gösterebiliyor bu bi dursun bakalım
    @Column(name = "UUID", updatable = false, columnDefinition = "uuid"/* , columnDefinition = "uniqueidentifier"*/)
    private UUID uuid;

    @Column(name = "CREATE_DATE")
    private LocalDateTime createDate;

    @Column(name = "CREATE_FK_USER")
    private Integer createFkUser;

    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;

    @Column(name = "MODIFIED_FK_USER")
    private Integer modifiedFkUser;

    @Column(name = "UPDATESEQ", columnDefinition = "smallint")
    private Integer updateseq;

    @PrePersist
    protected void preInsert() {
        this.setUpdateseq(0);
        this.setCreateDate(LocalDateTime.now());
        this.setUuid(UUID.randomUUID());
    }

    @Override
    public BaseEntity clone() {
        try {
            return (BaseEntity) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}