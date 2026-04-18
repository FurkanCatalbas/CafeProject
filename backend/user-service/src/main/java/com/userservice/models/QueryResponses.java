package com.userservice.models;

import com.wise.core.models.BaseQueryResponse;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
public class QueryResponses<T extends Serializable> extends BaseQueryResponse {

    List<T> data;
}
