package com.wise.core.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UIMessage {
    private int code;
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}