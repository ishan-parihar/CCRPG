export type AgentRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ToolCall {
  readonly id: string;
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly arguments: string; // JSON string parameters
  };
}

export interface AgentMessage {
  readonly role: AgentRole;
  readonly content: string | null;
  readonly toolCalls?: readonly ToolCall[];
  readonly toolCallId?: string; // For role === 'tool'
  readonly name?: string;       // For role === 'tool'
}

export interface MCQOption {
  readonly label: string;
  readonly description: string;
  readonly preview?: string;
}

export interface MCQQuestion {
  readonly question: string;
  readonly header: string;
  readonly options: readonly MCQOption[];
  readonly multiSelect: boolean;
  readonly allowWriteIn?: boolean;
}

export interface AskUserQuestionParams {
  readonly questions: readonly MCQQuestion[];
}

export interface UserAnswer {
  readonly selectedLabels: readonly string[];
  readonly writeInValue?: string;
  readonly note?: string;
}

export interface AskUserQuestionResult {
  readonly answers: readonly UserAnswer[];
}
