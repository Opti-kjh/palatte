# Palette 프로젝트 구동 로직 다이어그램

## 1. 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Palette MCP 서버"
        A[MCP 프로토콜 레이어]
        B[서비스 레이어]
        C[외부 API]
    end
    
    subgraph "MCP 프로토콜 레이어"
        D[도구 목록 핸들러]
        E[도구 호출 핸들러]
        F[에러 핸들러]
    end
    
    subgraph "서비스 레이어"
        G[Figma 서비스]
        H[디자인 시스템 서비스]
        I[코드 생성기]
    end
    
    subgraph "외부 API"
        J[Figma API]
        K[디자인 시스템 컴포넌트]
        L[GitHub 저장소]
    end
    
    A --> D
    A --> E
    A --> F
    B --> G
    B --> H
    B --> I
    C --> J
    C --> K
    C --> L
    
    G --> J
    H --> K
    I --> L
```

## 2. 주요 도구(Tools) 흐름도

```mermaid
graph TD
    A[사용자 요청] --> B{도구 선택}
    
    B --> C[Figma를 React로 변환]
    B --> D[Figma를 Vue로 변환]
    B --> E[디자인 시스템 컴포넌트 목록]
    B --> F[Figma 파일 분석]
    
    C --> G[Figma 서비스.데이터 가져오기]
    D --> G
    F --> G
    
    G --> H[디자인 시스템 서비스.최적 매칭]
    H --> I[코드 생성기.컴포넌트 생성]
    I --> J[React/Vue 코드 반환]
    
    E --> K[사용 가능한 컴포넌트 목록 반환]
```

## 3. Figma → React/Vue 변환 과정

```mermaid
graph TD
    A[Figma 디자인] --> B[Figma 서비스]
    
    subgraph "Figma 서비스 처리 과정"
        B1[URL에서 파일 ID 추출]
        B2[파일 데이터 파싱]
        B3[노드 구조 분석]
        B4[컴포넌트 정보 추출]
    end
    
    B --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    
    B4 --> C[디자인 시스템 서비스]
    
    subgraph "디자인 시스템 서비스 처리 과정"
        C1[사용 가능한 컴포넌트 목록 관리]
        C2[Figma 노드와 디자인 시스템 매핑]
        C3[최적 컴포넌트 선택]
    end
    
    C --> C1
    C1 --> C2
    C2 --> C3
    
    C3 --> D[코드 생성기]
    
    subgraph "코드 생성기 처리 과정"
        D1[컴포넌트 구조 생성]
        D2[Props 매핑]
        D3[Import 문 생성]
        D4[최종 코드 반환]
    end
    
    D --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
```

## 4. 컴포넌트 매핑 로직

```mermaid
graph TD
    A[Figma 노드] --> B[노드 분석]
    
    subgraph "노드 분석"
        B1[노드 타입: 텍스트, 프레임, 사각형, 컴포넌트]
        B2[노드 이름: 버튼, 입력, 카드 등]
        B3[노드 속성: 크기, 색상, 스타일]
    end
    
    B --> B1
    B --> B2
    B --> B3
    
    B1 --> C[컴포넌트 매칭 로직]
    B2 --> C
    B3 --> C
    
    subgraph "컴포넌트 매칭 로직"
        C1[직접 이름 매칭]
        C2[패턴 기반 매칭]
        C3[타입 기반 매칭]
        C4[기본값 매칭]
    end
    
    C --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    
    C1 --> D[버튼 컴포넌트]
    C2 --> E[입력 컴포넌트]
    C3 --> F[카드 컴포넌트]
    C4 --> G[기본 카드 컴포넌트]
```

## 5. 생성되는 코드 구조

```mermaid
graph TD
    A[코드 생성 시작] --> B[Import 문 생성]
    
    B --> C[디자인 시스템 패키지 Import]
    C --> D[React/Vue 기본 Import]
    
    D --> E[컴포넌트 구조 생성]
    
    subgraph "컴포넌트 구조"
        E1[인터페이스/Props 정의]
        E2[컴포넌트 함수 생성]
        E3[JSX/템플릿 생성]
        E4[Export 문 생성]
    end
    
    E --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    
    E4 --> F[최종 코드 반환]
```

## 6. 환경 설정 및 실행

```mermaid
graph TD
    A[프로젝트 시작] --> B[환경 변수 설정]
    
    B --> C[FIGMA_ACCESS_TOKEN 설정]
    C --> D[의존성 설치]
    
    D --> E[yarn install]
    E --> F[빌드]
    
    F --> G[yarn build]
    G --> H[MCP 서버 실행]
    
    H --> I[yarn mcp - 프로덕션]
    H --> J[yarn mcp:dev - 개발]
    
    I --> K[Cursor에서 MCP 서버 연결]
    J --> K
    
    K --> L[mcp-config.json 설정]
    L --> M[stdio 통신으로 연결]
```

## 7. 서비스 간 상호작용

```mermaid
sequenceDiagram
    participant U as 사용자
    participant M as MCP 서버
    participant F as Figma 서비스
    participant D as 디자인 시스템 서비스
    participant C as 코드 생성기
    
    U->>M: Figma를 React로 변환 요청
    M->>F: getFigmaData(figmaUrl, nodeId)
    F->>F: Figma API 호출
    F-->>M: FigmaFile 데이터
    
    M->>D: findBestMatch(figmaComponent, 'react')
    D->>D: 컴포넌트 매핑 로직 실행
    D-->>M: 디자인 시스템 컴포넌트
    
    M->>C: generateReactComponent(figmaData, componentName)
    C->>C: 컴포넌트 구조 생성
    C->>C: Props 매핑
    C->>C: Import 문 생성
    C-->>M: React 코드
    
    M-->>U: 생성된 React 컴포넌트 코드
```

## 8. 에러 처리 흐름

```mermaid
graph TD
    A[요청 처리 시작] --> B{에러 발생?}
    
    B -->|아니오| C[정상 처리]
    B -->|예| D[에러 타입 확인]
    
    D --> E[Figma API 에러]
    D --> F[디자인 시스템 에러]
    D --> G[코드 생성 에러]
    D --> H[기타 에러]
    
    E --> I[Figma 토큰 확인]
    F --> J[컴포넌트 매핑 실패]
    G --> K[코드 생성 실패]
    H --> L[알 수 없는 에러]
    
    I --> M[에러 메시지 반환]
    J --> M
    K --> M
    L --> M
    
    C --> N[성공 응답 반환]
    M --> O[에러 응답 반환]
```

이 Mermaid 다이어그램들은 Palette 프로젝트의 전체적인 구동 로직을 시각적으로 보여줍니다. 각 다이어그램은 시스템의 다른 측면을 다루며, 프로젝트의 구조와 동작 방식을 명확하게 이해할 수 있도록 도와줍니다.
