import { ModelAdapter, ModelInput, ModelOutput } from "./types.js";

export class MockModelAdapter implements ModelAdapter {
  public providerName = "mock";
  private responses: ModelOutput[] = [];

  constructor(presetResponses: ModelOutput[] = []) {
    this.responses = presetResponses;
  }

  public addResponse(res: ModelOutput) {
    this.responses.push(res);
  }

  public async generate(input: ModelInput): Promise<ModelOutput> {
    if (this.responses.length > 0) {
      return this.responses.shift()!;
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
