package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QueryPaging {
    private Integer pageNum;
    private Integer pageSize;
    private Long totalCount;
}