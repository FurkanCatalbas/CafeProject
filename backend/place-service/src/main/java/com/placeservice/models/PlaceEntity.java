package com.placeservice.models;


import com.wise.core.models.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PLACES")
public class PlaceEntity { // extend base entity lazım ama benim sql uuid sorunu veriyor onu hallederiz

    @Id
    @Column(name = "ID", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "STATUS", columnDefinition = "smallint", nullable = false)
    private Integer status;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    @Column(name = "MANAGER_ID", length = 50, nullable = false)
    private Integer managerId;

}
