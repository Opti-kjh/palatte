import axios, { AxiosInstance } from 'axios';

/**
 * Figma Desktop MCP 서버와 통신하는 클라이언트
 * HTTP 기반 MCP 서버와 JSON-RPC 2.0 프로토콜로 통신
 */
export class FigmaMCPClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private requestId: number = 0;

  constructor(baseUrl: string = 'http://127.0.0.1:3845/mcp') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * JSON-RPC 2.0 요청 생성
   */
  private createRequest(method: string, params?: any): any {
    return {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params: params || {},
    };
  }

  /**
   * MCP 서버에 요청 전송
   * HTTP 기반 MCP 서버는 JSON-RPC 2.0 프로토콜을 사용
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    try {
      const request = this.createRequest(method, params);
      
      // HTTP 기반 MCP 서버에 POST 요청
      const response = await this.client.post('', request);

      if (response.data.error) {
        throw new Error(
          `MCP Error: ${response.data.error.message || 'Unknown error'}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 연결 실패 시 null 반환 (폴백을 위해)
        if (
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.response?.status === 404
        ) {
          console.warn(`Figma MCP 서버 연결 실패 (${error.code || error.response?.status}), REST API로 폴백합니다.`);
          return null;
        }
        throw new Error(
          `Figma MCP connection error: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 사용 가능한 도구 목록 가져오기
   */
  async listTools(): Promise<any[]> {
    const result = await this.sendRequest('tools/list');
    return result?.tools || [];
  }

  /**
   * MCP 도구 호출
   */
  private async callTool(toolName: string, args: any): Promise<any> {
    try {
      const result = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (error) {
      console.warn(`Figma MCP 도구 ${toolName} 호출 실패:`, error);
      return null;
    }
  }

  /**
   * Figma 파일 데이터 가져오기
   * Figma MCP 서버의 도구를 사용하여 파일 정보 가져오기
   */
  async getFileData(fileId: string, nodeId?: string): Promise<any> {
    try {
      // 먼저 도구 목록을 확인
      const tools = await this.listTools();
      
      if (!tools || tools.length === 0) {
        return null;
      }

      // 파일 데이터를 가져오는 도구 찾기
      // Figma Desktop MCP 서버가 제공하는 일반적인 도구 이름들 시도
      const possibleToolNames = [
        'get_file',
        'getFile',
        'fetch_file',
        'fetchFile',
        'get_figma_file',
        'figma_get_file',
      ];

      for (const toolName of possibleToolNames) {
        const tool = tools.find((t: any) => t.name === toolName);
        if (tool) {
          const params: any = { fileId };
          if (nodeId) {
            params.nodeId = nodeId;
          }
          const result = await this.callTool(toolName, params);
          if (result) {
            return result;
          }
        }
      }

      // 도구를 찾지 못한 경우 null 반환 (폴백 사용)
      return null;
    } catch (error) {
      console.warn('Figma MCP 파일 데이터 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * Figma 노드 정보 가져오기
   */
  async getNodeData(fileId: string, nodeId: string): Promise<any> {
    try {
      const tools = await this.listTools();
      
      if (!tools || tools.length === 0) {
        return null;
      }

      // 노드 데이터를 가져오는 도구 찾기
      const possibleToolNames = [
        'get_node',
        'getNode',
        'fetch_node',
        'fetchNode',
        'get_figma_node',
        'figma_get_node',
      ];

      for (const toolName of possibleToolNames) {
        const tool = tools.find((t: any) => t.name === toolName);
        if (tool) {
          const result = await this.callTool(toolName, { fileId, nodeId });
          if (result) {
            return result;
          }
        }
      }

      // 노드 전용 도구가 없으면 파일 도구에 nodeId를 전달하여 시도
      return await this.getFileData(fileId, nodeId);
    } catch (error) {
      console.warn('Figma MCP 노드 데이터 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * MCP 서버 연결 상태 확인
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.listTools();
      return true;
    } catch (error) {
      return false;
    }
  }
}

