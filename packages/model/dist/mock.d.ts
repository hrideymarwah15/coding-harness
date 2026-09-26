import { ModelAdapter, ModelInput, ModelOutput } from "./types.js";
export declare class MockModelAdapter implements ModelAdapter {
    providerName: string;
    private responses;
    constructor(presetResponses?: ModelOutput[]);
    addResponse(res: ModelOutput): void;
    generate(input: ModelInput): Promise<ModelOutput>;
}
//# sourceMappingURL=mock.d.ts.map