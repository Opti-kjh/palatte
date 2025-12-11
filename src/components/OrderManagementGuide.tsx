import React from 'react';
// Design System 컴포넌트 import
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Check } from '@dealicious/design-system-react/src/components/ssm-check';
import { Chip } from '@dealicious/design-system-react/src/components/ssm-chip';
import { Tag } from '@dealicious/design-system-react/src/components/ssm-tag';
import { Text } from '@dealicious/design-system-react/src/components/ssm-text';
import { Dropdown } from '@dealicious/design-system-react/src/components/ssm-dropdown';
import { Icon } from '@dealicious/design-system-react/src/components/ssm-icon';

// 이미지 상수 정의
const imgComThumb80X80 = "http://localhost:3845/assets/a23a50ac4b0c21068425b9fbad7b10871c10708b.png";
const imgComThumb80X81 = "http://localhost:3845/assets/e7dd647a3f3a4b3b8333554648daac78edc8f0a8.png";
const imgComThumb80X82 = "http://localhost:3845/assets/428b26e10d3dccc7b39edb320853f5a5a9343bc7.png";
const imgComThumb80X83 = "http://localhost:3845/assets/2d8cebb7a930eb4beb026cf183bb70f432d00fe8.png";
const imgComThumb80X84 = "http://localhost:3845/assets/04789514f16aa28956a4a0c7d58b66d0ad9d03a6.png";
const imgComThumb80X85 = "http://localhost:3845/assets/ec6280d9d0c6cf7bd10ca6ba39cf132d15790a08.png";
const imgComThumb80X86 = "http://localhost:3845/assets/6006ff448e6770595c456de983e6af596bc9ecf2.png";
const imgComThumb80X87 = "http://localhost:3845/assets/5c335464e980f216e60ce1339fc1da90325ddce8.png";
const imgComThumb80X88 = "http://localhost:3845/assets/d06db60f0ce3d1a8a913812f3a977e24895e72ef.png";
const imgComThumb80X89 = "http://localhost:3845/assets/cf9069016fa2f8e1515a0dbabfe7fd88cb5c1d5a.png";
const imgComThumb80X90 = "http://localhost:3845/assets/fe4632a583f8225edd00b4ca191577b33eafbeff.png";
const imgComThumb80X91 = "http://localhost:3845/assets/daf12b453c04aa7032b812bba199d0d9a71fae1f.png";
const imgComThumb80X92 = "http://localhost:3845/assets/b226fd351bdd04b5dd222a331275c7cd2650b4a5.png";
const img = "http://localhost:3845/assets/f6843e9d48c5f4efce619a1dd1a4ac585682c746.svg";
const img1 = "http://localhost:3845/assets/cfdcad20a987a42a3a82975b10558672c6989679.svg";
const img2 = "http://localhost:3845/assets/02fb25fdf55c3329cb12788dda06eb81c93a6c97.svg";
const img3 = "http://localhost:3845/assets/a996cd8d306819476ae2b46cf48c5b05582487a0.svg";
const img4 = "http://localhost:3845/assets/9fc03fee616256d57ccf3c58c9348e5a2995aeb2.svg";
const img5 = "http://localhost:3845/assets/f9c30996c34ac82743f76638e5ffa7124a4fcac3.svg";
const img6 = "http://localhost:3845/assets/2e89ee11cc0020affd12b24169b5a1c75f41b507.svg";

/**
 * 주문 관리 안내 컴포넌트
 * 주문관리 화면에서 매장주문을 더욱 쉽게 확인하고 관리할 수 있도록 안내하는 모달 컴포넌트
 * Design System 컴포넌트를 사용하여 구현
 */
export default function OrderManagementGuide() {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  // 필터 옵션
  const orderStatusOptions = [
    { value: 'all', label: '전체' },
    { value: 'received', label: '주문접수' },
    { value: 'processing', label: '처리중' },
    { value: 'completed', label: '완료' },
  ];

  const periodOptions = [
    { value: '1month', label: '1개월' },
    { value: '3months', label: '3개월' },
    { value: '6months', label: '6개월' },
    { value: '1year', label: '1년' },
  ];

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      borderRadius: '10px',
      width: '100%',
      maxWidth: '360px'
    }}>
      {/* 헤더 섹션 */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center', 
        padding: '20px',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        width: '100%'
      }}>
        <Text variant="heading" size="large">
          주문 관리 안내
        </Text>
      </div>

      {/* 메인 콘텐츠 섹션 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        alignItems: 'center', 
        padding: '4px 16px 24px 16px',
        width: '100%'
      }}>
        {/* 설명 텍스트 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'flex-start', 
          width: '100%'
        }}>
          <div style={{ height: '18px', width: '3px' }}>
            <img alt="" src={img} style={{ width: '100%', height: '100%' }} />
          </div>
          <Text variant="body" size="small" color="#686e7b">
            주문관리 화면에서 매장주문을 더욱 쉽게 확인하고 관리할 수 있어요.
          </Text>
        </div>

        {/* 주문 관리 인터페이스 카드 */}
        <div style={{ 
          backgroundColor: '#f5f6fb', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px 12px',
          borderRadius: '6px',
          width: '100%'
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: '6px',
            width: '100%'
          }}>
            {/* 상단 필터 바 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              width: '100%'
            }}>
              <div style={{ 
                backgroundColor: '#ffffff', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                width: '100%'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '2.5px', 
                  alignItems: 'center', 
                  padding: '7.5px 10px',
                  width: '100%'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '2.5px', 
                    alignItems: 'center', 
                    flex: 1
                  }}>
                    {/* 주문상태 필터 - Chip 컴포넌트 사용 */}
                    <Chip variant="outlined" size="small">
                      주문상태
                      <Icon name="arrow-down" size="small" />
                    </Chip>
                    {/* 기간 필터 - Chip 컴포넌트 사용 */}
                    <Chip variant="outlined" size="small">
                      3개월
                      <Icon name="arrow-down" size="small" />
                    </Chip>
                  </div>
                  {/* 필터 아이콘 */}
                  <Chip variant="outlined" size="small">
                    <Icon name="filter" size="small" />
                  </Chip>
                </div>
                <div style={{ 
                  backgroundColor: '#ebeef6', 
                  height: '1px', 
                  width: '100%'
                }} />
              </div>
              {/* 섹션 헤더 */}
              <div style={{ 
                display: 'flex', 
                gap: '5px', 
                alignItems: 'flex-start', 
                padding: '8.8px 9.4px',
                width: '100%'
              }}>
                <Text variant="body" size="small">
                  거래완료 요청
                </Text>
                <Text variant="heading" size="small">
                  3
                </Text>
              </div>
            </div>

            {/* 주문 목록 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              width: '100%'
            }}>
              <div style={{ 
                backgroundColor: '#ebeef6', 
                height: '1px', 
                width: '100%'
              }} />

              {/* 첫 번째 주문 항목 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px', 
                alignItems: 'flex-start', 
                padding: '10px',
                width: '100%'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '7.5px', 
                  alignItems: 'flex-start', 
                  width: '100%'
                }}>
                  {/* 상태 태그 - Tag 컴포넌트 사용 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '2.5px', 
                    alignItems: 'center'
                  }}>
                    <Tag variant="error" size="small">주문접수</Tag>
                    <Tag variant="default" size="small">사입사 방문</Tag>
                    <Tag variant="default" size="small">현장 결제</Tag>
                  </div>
                  
                  {/* 주문 정보 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '7.5px', 
                    alignItems: 'center', 
                    width: '100%'
                  }}>
                    {/* 상품 썸네일 */}
                    <div style={{ 
                      border: '0.3px solid rgba(0,0,0,0.05)', 
                      borderRadius: '6px',
                      width: '45px',
                      height: '45px',
                      position: 'relative'
                    }}>
                      <img 
                        alt="상품 이미지" 
                        src={imgComThumb80X80} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '6px'
                        }} 
                      />
                    </div>
                    {/* 상품 상세 정보 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '5px', 
                      flex: 1
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.3px'
                      }}>
                        <Text variant="heading" size="small">
                          신상플래닛
                        </Text>
                        <Text variant="body" size="small" color="#686e7b">
                          베스트 검정 니트
                        </Text>
                      </div>
                      {/* 가격 정보 */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2.5px'
                      }}>
                        <Text variant="heading" size="small">
                          ₩30,000
                        </Text>
                        <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                          <img alt="" src={img4} style={{ width: '16px', height: '16px' }} />
                          <img alt="" src={img5} style={{ width: '16px', height: '16px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 주문 취소 버튼 - Button 컴포넌트 사용 */}
                <Button variant="secondary" size="medium" style={{ width: '100%' }}>
                  주문취소
                </Button>
              </div>

              {/* 구분선 */}
              <div style={{ 
                backgroundColor: '#ebeef6', 
                height: '1px', 
                width: '100%'
              }} />

              {/* 두 번째 주문 항목 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px', 
                alignItems: 'flex-start', 
                padding: '10px',
                width: '100%'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '7.5px', 
                  alignItems: 'flex-start', 
                  width: '100%'
                }}>
                  {/* 상태 태그 - Tag 컴포넌트 사용 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '2.5px', 
                    alignItems: 'center'
                  }}>
                    <Tag variant="warning" size="small">포장완료</Tag>
                    <Tag variant="default" size="small">직접 수령</Tag>
                    <Tag variant="default" size="small">현장 결제</Tag>
                  </div>
                  
                  {/* 주문 정보 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '7.5px', 
                    alignItems: 'center', 
                    width: '100%'
                  }}>
                    {/* 상품 썸네일 */}
                    <div style={{ 
                      border: '0.3px solid rgba(0,0,0,0.05)', 
                      borderRadius: '6px',
                      width: '45px',
                      height: '45px',
                      position: 'relative'
                    }}>
                      <img 
                        alt="상품 이미지" 
                        src={imgComThumb80X80} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '6px'
                        }} 
                      />
                    </div>
                    {/* 상품 상세 정보 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '5px', 
                      flex: 1
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.3px'
                      }}>
                        <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                          <Text variant="heading" size="small">
                            신상랩
                          </Text>
                          <div style={{ 
                            backgroundColor: '#fb4760', 
                            borderRadius: '11px',
                            width: '6px',
                            height: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img alt="" src={img6} style={{ width: '4px', height: '4px' }} />
                          </div>
                        </div>
                        <Text variant="body" size="small" color="#686e7b">
                          데일리 티셔츠 외 2건
                        </Text>
                      </div>
                      {/* 가격 정보 */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2.5px'
                      }}>
                        <Text variant="heading" size="small">
                          ₩56,000
                        </Text>
                        <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                          <img alt="" src={img4} style={{ width: '16px', height: '16px' }} />
                          <img alt="" src={img5} style={{ width: '16px', height: '16px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 다시 보지 않기 체크박스 - Check 컴포넌트 사용 */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          alignItems: 'flex-start', 
          width: '100%'
        }}>
          <Check 
            checked={dontShowAgain}
            onChange={(checked: boolean) => setDontShowAgain(checked)}
            label="다시 보지 않기"
          />
        </div>
      </div>

      {/* 하단 버튼 섹션 */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        width: '100%'
      }}>
        <div style={{ 
          backgroundColor: '#ebeef6', 
          height: '1px', 
          width: '100%'
        }} />
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          width: '100%'
        }}>
          {/* 확인 버튼 - Button 컴포넌트 사용 */}
          <Button variant="primary" size="medium" style={{ flex: 1 }}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
