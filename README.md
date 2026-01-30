Backend Portfolio: 그룹웨어 통합 시스템 개발
본 저장소는 실시간 통신의 안정성 확보와 전사 공통 코드를 활용한 데이터 아키텍처 설계에 집중한 그룹웨어 프로젝트입니다. 특히 1:1 채팅의 데이터 무결성 보장과 웹소켓 인증 흐름 최적화를 핵심 성과로 다루고 있습니다.

Technical Stack
Backend
<img src="https://img.shields.io/badge/Java-007396?style=flat&logo=java&logoColor=white"/> <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat&logo=springboot&logoColor=white"/> <img src="https://img.shields.io/badge/Spring%20Data%20JPA-6DB33F?style=flat&logo=spring&logoColor=white"/> <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white"/>

Frontend
<img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black"/>

Communication & Tools
<img src="https://img.shields.io/badge/WebSocket-010101?style=flat&logo=socket.io&logoColor=white"/> <img src="https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white"/>

Key Implementations
실시간 채팅 시스템 (Full-stack)
STOMP 기반 메시징: 1:1 및 팀 채팅을 위해 STOMP 브로커를 활용한 실시간 통신 환경을 구축했습니다.

메시지 영속화 및 브로드캐스트: 전송된 메시지를 DB에 즉시 기록하고, 트랜잭션 완료 시점에 맞춰 구독 중인 사용자들에게 메시지를 브로드캐스트 하도록 설계했습니다.

파일 전송 연동: 채팅 중 파일 공유가 가능하도록 멀티파트 파일 업로드 기능을 통합 모듈과 연계하여 구현했습니다.

공통 코드 기반 통합 알림 시스템
중복 로직 통합: 결재, 메일 등 도메인별로 분산된 알림 생성을 전사 공통 코드 테이블(tbl_common_code)과 OwnerType 상수를 활용하여 하나의 인터페이스로 통합했습니다.

실시간 푸시 기능: 알림 생성과 동시에 사용자의 특정 큐로 데이터를 전송하여 실시간 반응형 알림 UI를 구현했습니다.

Technical Troubleshooting
CASE 1: 1:1 채팅방 재활성화 시 데이터 중복 및 예외 해결
문제 상황: 사용자가 채팅방을 나간 후 재초대되거나 메시지를 수신할 때, 중복 데이터가 발생하여 서버 예외가 발생하고 UI에서 채팅방 목록이 사라지는 이슈가 있었습니다.

원인 분석: 초대 로직에서 활성 멤버만 필터링하면서 '나간 상태'의 회원을 신규 인원으로 오판하여 중복 INSERT를 시도하는 버그를 확인했습니다.

해결 방법:

DB 제약 조건: tbl_chat_employee에 사원 ID와 채팅방 ID 조합의 유니크 제약 조건을 추가하여 데이터 오염을 방지했습니다.

비즈니스 로직: 나간 회원을 재초대할 경우 기존 레코드의 상태(isLeft)만 업데이트하는 로직으로 고도화했습니다.

성과: 데이터 무결성을 확보하고 끊김 없는 채팅 사용자 경험을 제공했습니다.

CASE 2: 웹소켓 인증 소스 단일화 및 불일치 이슈 해결
문제 상황: HTTP 통신은 쿠키를, 웹소켓은 별도의 헤더를 인증 소스로 사용하면서 토큰 갱신 시 웹소켓 연결만 해제되는 문제가 발생했습니다.

해결 방법:

Handshake Interceptor: 웹소켓 연결 시점에 브라우저 쿠키를 읽어 세션 속성에 저장하는 인터셉터를 구현했습니다.

Auth Interceptor: StompAuthInterceptor가 헤더가 아닌 세션 내 쿠키 정보를 참조하여 인증을 수행하도록 로직을 통일했습니다.

성과: 인증 매커니즘을 쿠키로 단일화하여 실시간 통신의 연결 안정성을 대폭 향상시켰습니다.

Engineering Practice
공통 시스템 활용: 팀원들과 협업하여 구축한 공통 코드 시스템(data.sql)을 준수하여 데이터 정합성을 유지했습니다.

협업 방식: Main-Develop-Feature 전략을 사용해 코드 리뷰를 거친 후 병합을 수행했습니다.

Contact
GitHub: [경진님의 GitHub URL]

Email: [경진님의 이메일 주소]
