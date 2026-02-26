package com.userservice.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.userservice.enums.OutcomeType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public  class BaseResponse extends CoreDto {

    public BaseResponse() {
        // Varsayılan yapıcı
    }

    OutcomeType outcomeType = OutcomeType.success;
    @JsonProperty("uimessage")
    UIMessage uiMessage = null;

    public void setOutcome(OutcomeType type, String text) {
        setOutcomeType(type);
        UIMessage ui = new UIMessage();
        ui.setText(text);

    }

    public UIMessage getUIMessage() {
        if (uiMessage == null)
            uiMessage = new UIMessage();

        return uiMessage;
    }
}