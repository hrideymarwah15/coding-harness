export class MockModelAdapter {
    providerName = "mock";
    responses = [];
    constructor(presetResponses = []) {
        this.responses = presetResponses;
    }
    addResponse(res) {
        this.responses.push(res);
    }
    async generate(input) {
        if (this.responses.length > 0) {
            return this.responses.shift();
        }
        return {
            text: `[MockModel] Analyzed ${input.messages.length} messages. Ready for execution.`,
            toolCalls: [],
            usage: {
                promptTokens: 50,
                completionTokens: 20,
                totalTokens: 70
            }
        };
    }
}
//# sourceMappingURL=mock.js.map