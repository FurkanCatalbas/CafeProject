package com.placeservice.models;


import com.wise.core.enums.PlaceStatus;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50, nullable = false)
    private PlaceStatus status;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    @Column(name = "MANAGER_ID", length = 50, nullable = false)
    private Integer managerId;

    @Column(name = "QR_CODE", length = 100, unique = true)
    private String qrCode;

}
