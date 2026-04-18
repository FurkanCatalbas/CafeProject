package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class QueryResponse<T> extends BaseQueryResponse {
    T data;
}
