jQuery.sap.declare("nickcodeabortRequest.model.formatter");
nickcodeabortRequest.model.formatter = {
	FormatHeader: function(sHeader) {
		if (sHeader) {
			this.getParent().removeStyleClass("hideHeaderStyle");
		} else {
			this.getParent().addStyleClass("hideHeaderStyle");
		}
		return sHeader;
	}
};