import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  chatId: string;
  stream: boolean;
  detail: boolean;
  responseChatItemId: string;
  variables: Record<string, unknown>;
  messages: ChatMessage[];
}

// API响应中的使用统计信息
export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// API响应中的选择项消息
export interface ChoiceMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

// API响应中的选择项
export interface Choice {
  message: ChoiceMessage;
  finish_reason: 'stop' | 'length' | 'content_filter' | string;
  index: number;
}

// API的原始响应数据格式
export interface ApiResponseData {
  id: string;
  model: string;
  usage: Usage;
  choices: Choice[];
}

// 包装后的响应格式
export interface ChatCompletionResponse {
  success: boolean;
  data?: ApiResponseData;
  error?: string;
}

export async function chatCompletion(
  chatId: string,
  messages: ChatMessage[],
  authorization: string,
  variables: Record<string, unknown> = {},
  stream: boolean = false,
  detail: boolean = false,
  responseChatItemId?: string
): Promise<ChatCompletionResponse> {
  try {
    const requestData: ChatCompletionRequest = {
      chatId,
      stream,
      detail,
      responseChatItemId: responseChatItemId || `response_${Date.now()}`,
      variables,
      messages,
    };

    const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL+'/api/v1/chat/completions', requestData, {
      headers: {
        'Authorization': `Bearer ${authorization}`,
        'Content-Type': 'application/json'
      }
    });

    const data: ApiResponseData = response.data;
    return { success: true, data };
  } catch (error) {
    console.error('Error in chat completion:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// 便捷函数：发送简单的用户消息
export async function sendUserMessage(
  chatId: string,
  content: string,
  authorization: string,
  variables: Record<string, unknown> = {}
): Promise<ChatCompletionResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content
    }
  ];

  return chatCompletion(chatId, messages, authorization, variables);
}