import React from 'react';
// Design System 컴포넌트 import
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Chip } from '@dealicious/design-system-react/src/components/ssm-chip';
import { Tag } from '@dealicious/design-system-react/src/components/ssm-tag';
import { Text } from '@dealicious/design-system-react/src/components/ssm-text';
import { Icon } from '@dealicious/design-system-react/src/components/ssm-icon';

// 이미지 상수 정의 (Figma MCP에서 가져온 assets)
const imgComThumb80X80 = "http://localhost:3845/assets/a23a50ac4b0c21068425b9fbad7b10871c10708b.png";
const imgArrowRight = "http://localhost:3845/assets/f6843e9d48c5f4efce619a1dd1a4ac585682c746.svg";
const imgLogoSymbol = "http://localhost:3845/assets/cfdcad20a987a42a3a82975b10558672c6989679.svg";
const imgPlusText = "http://localhost:3845/assets/02fb25fdf55c3329cb12788dda06eb81c93a6c97.svg";
const imgNewBadge = "http://localhost:3845/assets/a996cd8d306819476ae2b46cf48c5b05582487a0.svg";
const imgTalkIcon = "http://localhost:3845/assets/9fc03fee616256d57ccf3c58c9348e5a2995aeb2.svg";
const imgSmallArrow = "http://localhost:3845/assets/f9c30996c34ac82743f76638e5ffa7124a4fcac3.svg";

// 디자인 토큰 (Figma에서 추출)
const designTokens = {
  colors: {
    textG100: '#222222',
    textG80: '#686E7B',
    textG70: '#8F97A7',
    lineG100: '#222222',
    lineG20: '#EBEEF6',
    lineG30: '#DFE3ED',
    bgG10: '#F5F6FB',
    bgG100: '#222222',
    primary01: '#FB4760',
    primary03: '#FEECEF',
    primary04: '#FFFFFF',
    secondary01: '#4759FB',
    secondary03: '#EAEFFF',
    mbs01: '#1F5EFF',
    mbs02: '#E5FE1E',
  },
};

/**
 * 주문 데이터 인터페이스
 */
interface Order {
  id: string;
  status: 'new' | 'complete_request' | 'packaged' | 'completed' | 'delivery';
  deliveryType: string;
  paymentType: string;
  storeName: string;
  productName: string;
  price: number;
  thumbnailUrl: string;
  isPlusStore?: boolean;
  isNew?: boolean;
  hasActionButton?: boolean;
}

/**
 * 필터 칩 데이터 인터페이스
 */
interface FilterChip {
  id: string;
  label: string;
  count?: number;
  isSelected: boolean;
}

/**
 * 도매 매장 주문 관리 컴포넌트 Props
 */
interface WholesaleOrderManagementProps {
  orders?: Order[];
  filterChips?: FilterChip[];
  onFilterChange?: (chipId: string) => void;
  onOrderClick?: (orderId: string) => void;
  onStatusChange?: (orderId: string) => void;
}

/**
 * Plus 배지 컴포넌트
 * 신상마켓 플러스 매장 표시 배지
 */
const PlusBadge: React.FC = () => (
  <div style={{
    backgroundColor: designTokens.colors.mbs01,
    height: '10px',
    borderRadius: '33px',
    width: '26px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 3px',
  }}>
    <div style={{ width: '4.5px', height: '4.5px' }}>
      <img alt="로고" src={imgLogoSymbol} style={{ width: '100%', height: '100%' }} />
    </div>
    <div style={{ width: '14px', height: '4.5px', marginLeft: '1.5px' }}>
      <img alt="plus" src={imgPlusText} style={{ width: '100%', height: '100%' }} />
    </div>
  </div>
);

/**
 * NEW 배지 컴포넌트
 */
const NewBadge: React.FC = () => (
  <div style={{
    backgroundColor: designTokens.colors.primary01,
    borderRadius: '11px',
    width: '10px',
    height: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <img alt="N" src={imgNewBadge} style={{ width: '4px', height: '4px' }} />
  </div>
);

/**
 * 주문서 보기 링크 컴포넌트
 */
const OrderViewLink: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    style={{
      display: 'flex',
      gap: '2.5px',
      alignItems: 'center',
      padding: '1.3px 0',
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    <Text variant="body" size="small" style={{ color: designTokens.colors.textG80, fontSize: '8.15px' }}>
      주문서 보기
    </Text>
    <div style={{ width: '16px', height: '16px' }}>
      <img alt="화살표" src={imgArrowRight} style={{ width: '100%', height: '100%' }} />
    </div>
  </div>
);

/**
 * 톡 아이콘 버튼 컴포넌트
 */
const TalkButton: React.FC = () => (
  <div style={{
    display: 'flex',
    gap: '2.5px',
    alignItems: 'center',
    padding: '0 10px',
    height: '20px',
    cursor: 'pointer',
  }}>
    <div style={{
      width: '6.7px',
      height: '6.7px',
      backgroundColor: designTokens.colors.textG70,
      borderRadius: '1px',
      overflow: 'hidden',
    }}>
      <img alt="톡" src={imgTalkIcon} style={{ width: '100%', height: '100%' }} />
    </div>
    <div style={{ width: '6.7px', height: '6.7px' }}>
      <img alt="화살표" src={imgSmallArrow} style={{ width: '100%', height: '100%' }} />
    </div>
  </div>
);

/**
 * 상태에 따른 태그 스타일 반환
 */
const getStatusTagStyle = (status: Order['status']): { bgColor: string; textColor: string; label: string } => {
  switch (status) {
    case 'new':
      return {
        bgColor: designTokens.colors.secondary03,
        textColor: designTokens.colors.secondary01,
        label: '신규주문',
      };
    case 'complete_request':
      return {
        bgColor: designTokens.colors.primary03,
        textColor: designTokens.colors.primary01,
        label: '거래완료 요청',
      };
    case 'packaged':
      return {
        bgColor: designTokens.colors.secondary03,
        textColor: designTokens.colors.secondary01,
        label: '포장완료',
      };
    case 'completed':
      return {
        bgColor: '#E8F5E9',
        textColor: '#4CAF50',
        label: '거래완료',
      };
    case 'delivery':
      return {
        bgColor: '#FFF3E0',
        textColor: '#FF9800',
        label: '택배주문',
      };
    default:
      return {
        bgColor: designTokens.colors.lineG20,
        textColor: designTokens.colors.textG80,
        label: '알 수 없음',
      };
  }
};

/**
 * 주문 항목 컴포넌트
 */
const OrderItem: React.FC<{
  order: Order;
  onOrderClick?: () => void;
  onStatusChange?: () => void;
}> = ({ order, onOrderClick, onStatusChange }) => {
  const statusStyle = getStatusTagStyle(order.status);

  return (
    <div style={{
      backgroundColor: designTokens.colors.primary04,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-start',
      padding: '10px',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7.5px',
        alignItems: 'flex-start',
        width: '100%',
      }}>
        {/* 태그 및 주문서 보기 링크 */}
        <div style={{
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* 상태 태그 그룹 */}
          <div style={{ flex: 1, display: 'flex', gap: '2.5px', alignItems: 'center' }}>
            {/* 주문 상태 태그 */}
            <Tag
              variant="custom"
              size="small"
              style={{
                backgroundColor: statusStyle.bgColor,
                color: statusStyle.textColor,
                height: '16px',
                padding: '0 5px',
                borderRadius: '4px',
                fontSize: '7.5px',
                fontWeight: 600,
              }}
            >
              {statusStyle.label}
            </Tag>
            {/* 배송 유형 태그 */}
            <Tag
              variant="outlined"
              size="small"
              style={{
                backgroundColor: designTokens.colors.primary04,
                border: `1px solid ${designTokens.colors.lineG20}`,
                color: designTokens.colors.textG80,
                height: '16px',
                padding: '0 5px',
                borderRadius: '4px',
                fontSize: '7.5px',
                fontWeight: 600,
              }}
            >
              {order.deliveryType}
            </Tag>
            {/* 결제 유형 태그 */}
            <Tag
              variant="outlined"
              size="small"
              style={{
                backgroundColor: designTokens.colors.primary04,
                border: `1px solid ${designTokens.colors.lineG20}`,
                color: designTokens.colors.textG80,
                height: '16px',
                padding: '0 5px',
                borderRadius: '4px',
                fontSize: '7.5px',
                fontWeight: 600,
              }}
            >
              {order.paymentType}
            </Tag>
          </div>
          {/* 주문서 보기 링크 */}
          <OrderViewLink onClick={onOrderClick} />
        </div>

        {/* 주문 정보 */}
        <div style={{
          display: 'flex',
          gap: '7.5px',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* 상품 썸네일 */}
          <div style={{
            border: '0.3px solid rgba(0,0,0,0.05)',
            borderRadius: '6px',
            width: '45px',
            height: '45px',
            overflow: 'hidden',
          }}>
            <img
              alt="상품 이미지"
              src={order.thumbnailUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* 상품 상세 정보 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            flex: 1,
            justifyContent: 'center',
          }}>
            {/* 매장명 및 배지 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.3px',
            }}>
              <div style={{
                display: 'flex',
                gap: '2.5px',
                alignItems: 'center',
              }}>
                <Text
                  variant="heading"
                  size="small"
                  style={{
                    color: designTokens.colors.textG100,
                    fontSize: '9.4px',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.storeName}
                </Text>
                {order.isPlusStore && <PlusBadge />}
                {order.isNew && <NewBadge />}
              </div>
              <Text
                variant="body"
                size="small"
                style={{
                  color: designTokens.colors.textG80,
                  fontSize: '8.77px',
                }}
              >
                {order.productName}
              </Text>
            </div>

            {/* 가격 정보 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              height: '12.5px',
              position: 'relative',
            }}>
              <Text
                variant="heading"
                size="small"
                style={{
                  color: designTokens.colors.textG100,
                  fontSize: '8.77px',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                ₩{order.price.toLocaleString()}
              </Text>
              {/* 톡 버튼 */}
              <div style={{ position: 'absolute', right: '-10px', top: '-3.8px' }}>
                <TalkButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 (신규주문인 경우만 표시) */}
      {order.hasActionButton && (
        <Button
          variant="secondary"
          size="medium"
          onClick={onStatusChange}
          style={{
            width: '100%',
            minHeight: '29px',
            padding: '8px 12.5px',
            border: `1px solid ${designTokens.colors.lineG30}`,
            borderRadius: '6px',
            backgroundColor: designTokens.colors.primary04,
            color: designTokens.colors.textG80,
            fontSize: '8.77px',
            fontWeight: 600,
          }}
        >
          포장 완료 상태로 변경하기
        </Button>
      )}
    </div>
  );
};

/**
 * 도매 매장 주문 관리 컴포넌트
 * Figma 디자인(node: 45733:32370)을 Design System 컴포넌트로 변환
 */
export default function WholesaleOrderManagement({
  orders: propOrders,
  filterChips: propFilterChips,
  onFilterChange,
  onOrderClick,
  onStatusChange,
}: WholesaleOrderManagementProps) {
  // 기본 필터 칩 데이터
  const defaultFilterChips: FilterChip[] = [
    { id: 'all', label: '전체', isSelected: true },
    { id: 'new', label: '주문', count: 3, isSelected: false },
    { id: 'packaged', label: '포장완료', isSelected: false },
    { id: 'completed', label: '거래완료', isSelected: false },
    { id: 'delivery', label: '택배주문', isSelected: false },
  ];

  // 기본 주문 데이터
  const defaultOrders: Order[] = [
    {
      id: '1',
      status: 'new',
      deliveryType: '사입사 방문',
      paymentType: '현장 결제',
      storeName: '신상플래닛',
      productName: '베스트 검정 니트',
      price: 30000,
      thumbnailUrl: imgComThumb80X80,
      isPlusStore: true,
      isNew: true,
      hasActionButton: true,
    },
    {
      id: '2',
      status: 'complete_request',
      deliveryType: '직접 수령',
      paymentType: '현장 결제',
      storeName: '신상랩',
      productName: '데일리 티셔츠 외 2건',
      price: 56000,
      thumbnailUrl: imgComThumb80X80,
      isPlusStore: true,
      isNew: false,
      hasActionButton: false,
    },
  ];

  const [selectedFilter, setSelectedFilter] = React.useState('all');
  const filterChips = propFilterChips || defaultFilterChips;
  const orders = propOrders || defaultOrders;

  // 필터 변경 핸들러
  const handleFilterChange = (chipId: string) => {
    setSelectedFilter(chipId);
    onFilterChange?.(chipId);
  };

  // 신규주문 개수 계산
  const newOrderCount = orders.filter(order => order.status === 'new').length;

  return (
    <div style={{
      backgroundColor: designTokens.colors.bgG10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '16px 12px',
      borderRadius: '6px',
      width: '100%',
    }}>
      <div style={{
        backgroundColor: designTokens.colors.primary04,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: '6px',
        width: '100%',
      }}>
        {/* 상단 필터 바 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}>
          {/* 필터 칩 영역 */}
          <div style={{
            backgroundColor: designTokens.colors.primary04,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              gap: '2.5px',
              alignItems: 'center',
              padding: '7.5px 10px',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                gap: '2.5px',
                alignItems: 'center',
                flex: 1,
              }}>
                {filterChips.map((chip) => {
                  const isSelected = selectedFilter === chip.id;
                  return (
                    <Chip
                      key={chip.id}
                      variant={isSelected ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() => handleFilterChange(chip.id)}
                      style={{
                        height: '22px',
                        padding: '6.9px 8.25px',
                        borderRadius: '100px',
                        backgroundColor: designTokens.colors.primary04,
                        border: isSelected
                          ? `1px solid ${designTokens.colors.lineG100}`
                          : `1px solid ${designTokens.colors.lineG20}`,
                        color: designTokens.colors.textG100,
                        fontSize: '9.63px',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {chip.label}{chip.count ? ` ${chip.count}` : ''}
                    </Chip>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{
            backgroundColor: designTokens.colors.lineG20,
            height: '0.63px',
            width: '100%',
          }} />

          {/* 신규주문 카운트 */}
          <div style={{
            backgroundColor: designTokens.colors.primary04,
            display: 'flex',
            gap: '5px',
            alignItems: 'flex-start',
            padding: '8.8px 9.4px',
            height: '30px',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              gap: '1.3px',
              alignItems: 'center',
              flex: 1,
            }}>
              <Text
                variant="body"
                size="small"
                style={{
                  color: designTokens.colors.textG100,
                  fontSize: '8.77px',
                }}
              >
                신규주문
              </Text>
              <Text
                variant="heading"
                size="small"
                style={{
                  color: designTokens.colors.textG100,
                  fontSize: '8.77px',
                  fontWeight: 600,
                }}
              >
                {newOrderCount}
              </Text>
            </div>
          </div>
        </div>

        {/* 주문 목록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* 상단 구분선 */}
          <div style={{
            backgroundColor: designTokens.colors.lineG20,
            height: '0.63px',
            width: '100%',
          }} />

          {/* 주문 항목 렌더링 */}
          {orders.map((order, index) => (
            <React.Fragment key={order.id}>
              <OrderItem
                order={order}
                onOrderClick={() => onOrderClick?.(order.id)}
                onStatusChange={() => onStatusChange?.(order.id)}
              />
              {/* 주문 항목 간 구분선 */}
              {index < orders.length - 1 && (
                <div style={{
                  backgroundColor: designTokens.colors.lineG20,
                  height: '0.63px',
                  width: '100%',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 홈 인디케이터 (모바일 UI) */}
        <div style={{
          backgroundColor: designTokens.colors.primary04,
          height: '21.3px',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '5.6px',
        }}>
          <div style={{
            backgroundColor: designTokens.colors.bgG100,
            height: '3.1px',
            width: '84px',
            borderRadius: '100px',
          }} />
        </div>
      </div>
    </div>
  );
}
