package com.userservice.models;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseQueryResponse extends BaseResponse {
    QueryPaging paging = null;
}
