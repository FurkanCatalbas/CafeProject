package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class QueryResponses<T> extends BaseQueryResponse {
    List<T> data;
}
