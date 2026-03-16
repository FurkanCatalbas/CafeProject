package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class QueryResponses<T extends Serializable> extends BaseQueryResponse {
    List<T> data;
}