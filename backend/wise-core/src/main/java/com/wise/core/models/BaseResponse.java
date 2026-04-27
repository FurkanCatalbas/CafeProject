package com.wise.core.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wise.core.enums.OutcomeType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BaseResponse extends CoreDto {

    OutcomeType outcomeType = OutcomeType.success;

    @JsonProperty("uimessage")
    UIMessage uiMessage = null;

    public void setOutcome(OutcomeType type, String text) {
        setOutcomeType(type);
        UIMessage ui = new UIMessage();
        ui.setText(text);
        setUiMessage(ui);
    }

    public UIMessage getUIMessage() {
        if (uiMessage == null) uiMessage = new UIMessage();
        return uiMessage;
    }
}
