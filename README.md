
<img src="https://github.com/user-attachments/assets/fd211198-6bd7-4d53-9f72-abc2aea19922" width="30%"/>


# [프로젝트 명: StartUp]
> **한 줄 소개:** 기업의 효율적인 업무 처리를 위한 웹 기반 그룹웨어 서비스

<a href="#"><img src="https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white"/></a>
<a href="#"><img src="https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white"/></a>
<a href="#"><img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/></a>

<br/>

## 1. 프로젝트 소개
**개발 기간:** 2025.10.22 ~ 2025.11.26 (약 6주)  
**개발 인원:** 5명 (Full Stack)  

**기획 의도:** 기존 그룹웨어의 복잡한 UI를 개선하고, 이슈 관리 및 실시간 협업 기능을 강화하여 실제 스타트업 환경에서 사용할 수 있는 그룹웨어를 목표로 제작했습니다.

<br/>

## 2. 주요 기능 및 산출물
프로젝트 진행 과정에서 작성한 기술 문서 및 설계 산출물입니다.

| 구분 | 산출물 | 링크 |
|:---:|:---:|:---:|
| **설계** | 요구사항 정의서 | [이미지 보기](https://github.com/user-attachments/assets/091e2955-8d0d-4635-bb79-94c148645bb0) |
| **설계** | WBS | [이미지 보기](https://github.com/user-attachments/assets/1722a83c-385c-45e0-a608-41b7dc77aee6) |
| **설계** | 테이블 정의서 | [이미지 보기](https://github.com/user-attachments/assets/28e5d35a-3de6-4d58-95f6-2ad108471403) |
| **설계** | 유스케이스 | [이미지 보기](https://github.com/user-attachments/assets/3654216f-c283-41b1-8e24-41919aed15ba) |
<br/>

<br/>

## 3. 기술 스택 (Tech Stack)

### 🎨 Frontend
| HTML5 | CSS3 | JavaScript | React | Material UI |
| :---: | :---: | :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white"/> | <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white"/> | <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/> | <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> | <img src="https://img.shields.io/badge/MUI-007FFF?style=flat-square&logo=mui&logoColor=white"/> |

### 🛠 Backend & Database
| Java | Spring Boot | MySQL |
| :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white"/> | <img src="https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white"/> | <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white"/> |

### 🚀 Infra & Tools
| AWS | Docker | Tomcat | Synology |
| :---: | :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white"/> | <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/> | <img src="https://img.shields.io/badge/Tomcat-F8DC75?style=flat-square&logo=apache-tomcat&logoColor=black"/> | <img src="https://img.shields.io/badge/Synology-B3B3B3?style=flat-square&logo=synology&logoColor=white"/> |

### 📂 Version Control
| Git | GitHub |
| :---: | :---: |
| <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/> | <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/> |

### 💻 IDE
| IntelliJ IDEA | VS Code |
| :---: | :---: |
| <img src="https://img.shields.io/badge/IntelliJ%20IDEA-000000.svg?style=flat-square&logo=intellij-idea&logoColor=white"/> | <img src="https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=flat-square&logo=Visual%20Studio%20Code&logoColor=white"/> |

<br/>

## 4. 시스템 아키텍처 & ERD
<details>
<summary><b>👆 ERD 다이어그램 보기 (Click)</b></summary>
<div markdown="1">
<img width="1832" height="1861" alt="Image" src="https://github.com/user-attachments/assets/65d168f2-8a8d-4574-b5ca-9c51bc9e4b81" />
</div>
</details>

<br/>

## 5. 핵심 기능 구현 (Key Features)

### 🔹 1. 실시간 알림 및 채팅
> **담당자:** 김경진
> **기능 설명:** JWT 인증을 통해 WebSocket과 STOMP를 사용하여 각 기능에 따라 사용자에게 실시간 알림 전송 및 실시간 1:1 & 팀 채팅 시스템
- **구현 내용:**
  - STOMP 프로토콜을 활용한 부서별/개인별 채팅방 구현
  - 읽지 않은 메시지 카운트 처리 및 DB 동기화
  - 결재, 일정 등 각 모듈별 이벤트 발생 시 실시간 알림(Notification) 발송 로직 구현

<br/>
실시간 알림 시연 영상
<img src="https://github.com/user-attachments/assets/c214d9f5-4a55-4ab6-8774-edcd6990193f" width="80%" alt="실시간 알림 시연 영상"/>
<br/>
실시간 채팅 메시지 전송
<img src="https://github.com/user-attachments/assets/fff39083-f61b-474a-9b6d-b62b79bec531" width="80%" alt="실시간 채팅 메시지 전송 영상"/>
<br/>
실시간 메시지 읽음 처리
<img src="https://github.com/user-attachments/assets/29bbbe73-2dda-42ae-9207-3ddfd243b7bf" width="80%" alt="실시간 메시지 읽음 처리 영상"/>

## 6. 트러블 슈팅 (Trouble Shooting)

### 🔥 Issue 1. HTTP와 WebSocket 간 인증 토큰 불일치 문제
> **상황:** HTTP 요청(Axios)은 `HttpOnly Cookie`를, WebSocket(STOMP)은 `Header(LocalStorage)`를 통해 토큰 인증을 수행하는 하이브리드 구조.
- **문제:** Access Token 만료 시, Axios는 쿠키를 통해 토큰을 자동 갱신하지만, WebSocket은 LocalStorage에 남아있는 **만료된 토큰**을 계속 참조하여 연결이 끊기는 현상 발생.
- **해결:** **"인증 소스 단일화"**
  1. WebSocket 연결 시 헤더가 아닌 **HttpOnly Cookie**를 참조하도록 변경.
  2. Spring의 `HttpHandshakeInterceptor`를 구현하여, Handshake 단계에서 쿠키에 있는 토큰을 추출해 WebSocket 세션 속성으로 전달.
  3. 결과적으로 HTTP와 WebSocket이 동일한 쿠키를 바라보게 되어, **토큰 갱신 시 별도의 로직 없이 양쪽 모두 인증이 유지**되도록 개선함.

<br/>

### 🔥 Issue 2. 채팅방 초대 시 중복 데이터 생성 및 동시성 이슈
> **상황:** 채팅방 초대 로직 수행 시 `IncorrectResultSizeDataAccessException` 발생.
- **원인:**
  1. **로직 오류:** '나갔던 사용자(`isLeft=true`)'를 재초대할 때, 기존 데이터를 Update 하는 것이 아니라 신규 Insert를 시도함.
  2. **동시성 문제:** 더블 클릭 등으로 동시에 요청이 들어올 경우, 애플리케이션 레벨의 중복 검사를 통과하여 중복 데이터가 쌓임.
- **해결:** **"DB 제약조건과 로직 분리 이중 방어"**
  1. **DB 레벨:** `employee_id`와 `chat_room_id` 복합 컬럼에 **Unique Constraint**를 걸어 데이터 오염을 원천 차단.
  2. **App 레벨:** 초대 로직을 `신규(Insert)`, `재참여(Update)`, `기존(Ignore)` 3가지 케이스로 분리하여 구현.
  3. 이를 통해 데이터 무결성을 보장하고 예외 발생을 방지함.

<br/>

### 🔥 Issue 3. 채팅방 퇴장 후 재입장 불가 및 목록 증발 현상
- **문제:** 1:1 채팅방에서 상대방이 나간 경우(`isLeft=true`), 남아있는 사용자의 채팅방 목록에서 해당 방이 사라지거나, 나간 사용자가 재입장 시 404/403 에러 발생.
- **원인:** JPA 조회 쿼리에서 `isLeft=false`인 사용자만 필터링하여 조회했기 때문에, 나간 사용자가 포함된 방을 찾지 못하거나 권한이 없다고 판단함.
- **해결:**
  1. 채팅방 목록 조회 시, 참여 상태(`isLeft`)와 관계없이 방을 조회하되 참여자 정보를 DTO에 매핑하도록 쿼리 수정.
  2. 재입장(`rejoin`) 메서드를 별도로 구현하여, 퇴장한 사용자가 다시 메시지를 보내거나 초대받을 경우 `isLeft` 플래그를 `false`로 update 하도록 로직 변경.

<br/>

## 7. 프로젝트 회고 (Retrospective)
이번 프로젝트는 단순한 기능 구현을 넘어, **협업을 위한 문서화**와 **새로운 기술에 대한 도전 의식**을 기를 수 있었던 값진 시간이었습니다.

- **Keep (좋았던 점):**
  - **기여 가이드(CONTRIBUTING.md) 도입:** 팀원 간의 코드 일관성을 위해 [CONTRIBUTING.md](./CONTRIBUTING.md)를 직접 작성하고 도입했습니다. 이를 통해 브랜치 명명 규칙과 커밋 메시지 컨벤션을 통일하여 협업 효율을 극대화했습니다.
  - 매일 아침 데일리 미팅을 통해 이슈를 조기에 파악하고, 일정 지연 없이 프로젝트를 마무리했습니다.

- **Growth (성장 경험):**
  - **"두려움을 자신감으로 바꾼 WebSocket 도전"**
    처음 접해보는 WebSocket 기술을 도입할 때 구조 파악부터 난관이 있었지만, 포기하지 않고 구현에 성공하여 실시간 채팅이 작동하는 것을 보았을 때 큰 성취감을 느꼈습니다. 이 경험을 통해 **"아무리 낯선 기술이라도 부딪혀보면 충분히 해낼 수 있다"**는 자신감을 얻었고, 앞으로 마주할 새로운 기술들도 두려움 없이 도전할 수 있다는 확신이 생겼습니다.

- **Try (시도할 점):**
  - 이번 프로젝트를 통해 개발의 재미를 깊이 느꼈습니다. 다음에는 현재 구현한 기능들을 고도화하거나, 아직 다뤄보지 못한 더 복잡하고 심도 있는 기능 구현에 욕심을 내어 도전해보고 싶습니다.
