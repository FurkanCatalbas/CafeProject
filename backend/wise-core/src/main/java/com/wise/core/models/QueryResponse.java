package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
public class QueryResponse<T extends Serializable> extends BaseQueryResponse {
    T data;
}