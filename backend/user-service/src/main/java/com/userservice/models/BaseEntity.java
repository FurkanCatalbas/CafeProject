package com.userservice.models;

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


    @Column(name = "UUID", updatable = false, columnDefinition = "uuid")
    private UUID uuid; // string


    @Column(name = "CREATE_DATE",nullable = true)
    private LocalDateTime createDate;

    @Column(name = "CREATE_FK_USER",nullable = true)
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
        this.setUuid(UUID.randomUUID()); //(UUID.randomUUID().toString().toUpperCase());
    }

    @PreUpdate
    protected void preUpdate() {
      /* this.setModifyDate(new Date());
        this.setSender(0);

        if (ObjectUtils.isEmpty(this.getUpdateseq()))
            this.setUpdateseq(0);

        this.setUpdateseq(this.getUpdateseq() + 1);*/

        // SQL Server'da SMALLINT veri türünün maksimum değeri 32767'dir.
        // Bu nedenle, updateseq değeri 32000'ten büyük olursa,
        // updateseq değeri 1 olarak sıfırlanır ve bir sonraki güncellemede
     /*   // tekrar artırılmaya başlanır.
        if(this.getUpdateseq()>32000)
            this.setUpdateseq(1);*/
    }

    @Override
    public BaseEntity clone() {
        try {
            BaseEntity clone = (BaseEntity) super.clone();
            return clone;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}