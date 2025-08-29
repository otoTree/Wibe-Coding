import axios from 'axios';

export interface CreateFragmentRequest {
  text: string;
  datasetId: string;
  parentId?: string | null;
  name: string;
  trainingType: string;
  chunkSettingMode: string;
  qaPrompt: string;
  metadata: Record<string, unknown>;
  tags: Array<string>,
}

export interface CreateFragmentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function createFragment(fragmentText: string, authorization: string,tags:Array<string>,name:string,datasetId:string): Promise<CreateFragmentResponse> {
  try {
    const requestData: CreateFragmentRequest = {
      text: fragmentText,
      datasetId: datasetId,
      parentId: null,
      name: name,
      trainingType: "qa",
      chunkSettingMode: "auto",
      qaPrompt: "",
      metadata: {},
      tags: tags,
    };

    const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL+'/api/core/dataset/collection/create/text', requestData, {
      headers: {
        'Authorization': `Bearer ${authorization}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating fragment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}