// organizationApi.js

import axios from "axios";

const API_BASE_URL = "/api";

export const organizationAPI = {
    
    // 부서 목록 조회
    getDepartments: async () => {
        try {
        const res = await axios.get(`${API_BASE_URL}/commoncode/department`);
        return res.data;
            } catch (err) {
                console.warn("서버요청 실패 후 더미데이터로 대체");
        return [
            { code: "DP1", value1: "스타트업", value2: null, codeDescription: "부서" },
        { code: "DP2", value1: "경영지원본부", value2: "DP1", codeDescription: "부서" },
        { code: "DP3", value1: "인사팀", value2: "DP2", codeDescription: "부서" },
        { code: "DP4", value1: "재무회계팀", value2: "DP2", codeDescription: "부서" },
        { code: "DP5", value1: "총무팀", value2: "DP2", codeDescription: "부서" },
        { code: "DP6", value1: "R&D 본부", value2: "DP1", codeDescription: "부서" },
        { code: "DP7", value1: "백엔드개발팀", value2: "DP6", codeDescription: "부서" },
        { code: "DP8", value1: "프론트엔드개발팀", value2: "DP6", codeDescription: "부서" },
        { code: "DP9", value1: "UI/UX 디자인팀", value2: "DP6", codeDescription: "부서" },
        { code: "DP10", value1: "QA팀", value2: "DP6", codeDescription: "부서" },
        { code: "DP11", value1: "사업본부", value2: "DP1", codeDescription: "부서" },
        { code: "DP12", value1: "영업1팀", value2: "DP11", codeDescription: "부서" },
        { code: "DP13", value1: "영업2팀", value2: "DP11", codeDescription: "부서" },
        { code: "DP14", value1: "마케팅팀", value2: "DP11", codeDescription: "부서" },
        { code: "DP15", value1: "C-Level", value2: "DP1", codeDescription: "부서" },
        { code: "DP16", value1: "대표이사", value2: "DP15", codeDescription: "부서" },
        ];
    }
},

    // 직원 목록 조회
    getEmployeesByDeptCode: async (deptCode) => {
        try {
        const res = await axios.get(`${API_BASE_URL}/employee/department/${deptCode}`);
        return res.data;
    } catch (err) {
        console.warn("서버요청 실패 후 더미데이터로 대체");  // JWT인증 필요, 그래서 실패해도 더미데이터로 표시.
        const employees = [
             { id: 1, name: "관리자", dept: "DP7", deptName: "백엔드개발팀", position: "부장", email: "admin@startup.com", phone: "010-0000-0001" },
        { id: 2, name: "대표이사", dept: "DP16", deptName: "대표이사", position: "대표이사", email: "ceo@startup.com", phone: "010-1111-1111" },
        { id: 3, name: "인사과장", dept: "DP3", deptName: "인사팀", position: "과장", email: "hr@startup.com", phone: "010-2222-2222" },
        { id: 4, name: "인사사원", dept: "DP3", deptName: "인사팀", position: "사원", email: "hr_staff@startup.com", phone: "010-2222-2223" },
        { id: 5, name: "재무차장", dept: "DP4", deptName: "재무회계팀", position: "차장", email: "finance@startup.com", phone: "010-3333-3333" },
        { id: 6, name: "재무주임", dept: "DP4", deptName: "재무회계팀", position: "주임", email: "finance_staff@startup.com", phone: "010-3333-3334" },
        { id: 7, name: "총무대리", dept: "DP5", deptName: "총무팀", position: "대리", email: "ga@startup.com", phone: "010-4444-4444" },
        { id: 8, name: "총무사원", dept: "DP5", deptName: "총무팀", position: "사원", email: "ga_staff@startup.com", phone: "010-4444-4445" },
        { id: 9, name: "백엔드대리", dept: "DP7", deptName: "백엔드개발팀", position: "대리", email: "backend1@startup.com", phone: "010-5555-5551" },
        { id: 10, name: "백엔드사원", dept: "DP7", deptName: "백엔드개발팀", position: "사원", email: "backend2@startup.com", phone: "010-5555-5552" },
        { id: 11, name: "프론트과장", dept: "DP8", deptName: "프론트엔드개발팀", position: "과장", email: "frontend1@startup.com", phone: "010-6666-6661" },
        { id: 12, name: "프론트사원", dept: "DP8", deptName: "프론트엔드개발팀", position: "사원", email: "frontend2@startup.com", phone: "010-6666-6662" },
        { id: 13, name: "디자인대리", dept: "DP9", deptName: "UI/UX 디자인팀", position: "대리", email: "design1@startup.com", phone: "010-7777-7771" },
        { id: 14, name: "디자인주임", dept: "DP9", deptName: "UI/UX 디자인팀", position: "주임", email: "design2@startup.com", phone: "010-7777-7772" },
        { id: 15, name: "품질대리", dept: "DP10", deptName: "QA팀", position: "대리", email: "qa1@startup.com", phone: "010-8888-8881" },
        { id: 16, name: "품질사원", dept: "DP10", deptName: "QA팀", position: "사원", email: "qa2@startup.com", phone: "010-8888-8882" },
        { id: 17, name: "영업1팀장", dept: "DP12", deptName: "영업1팀", position: "차장", email: "sales1@startup.com", phone: "010-9999-9991" },
        { id: 18, name: "영업1팀원", dept: "DP12", deptName: "영업1팀", position: "사원", email: "sales1_staff@startup.com", phone: "010-9999-9992" },
        { id: 19, name: "영업2팀장", dept: "DP13", deptName: "영업2팀", position: "과장", email: "sales2@startup.com", phone: "010-1010-1011" },
        { id: 20, name: "영업2팀원", dept: "DP13", deptName: "영업2팀", position: "사원", email: "sales2_staff@startup.com", phone: "010-1010-1012" },
        { id: 21, name: "마케팅대리", dept: "DP14", deptName: "마케팅팀", position: "대리", email: "mkt1@startup.com", phone: "010-1212-1211" },
        { id: 22, name: "마케팅사원", dept: "DP14", deptName: "마케팅팀", position: "사원", email: "mkt2@startup.com", phone: "010-1212-1212" },
        { id: 23, name: "경영이사", dept: "DP15", deptName: "C-Level", position: "이사", email: "clevel@startup.com", phone: "010-1313-1313" },
        { id: 24, name: "전략기획", dept: "DP15", deptName: "C-Level", position: "부장", email: "strategy@startup.com", phone: "010-1313-1314" },
        { id: 25, name: "사업본부장", dept: "DP11", deptName: "사업본부", position: "이사", email: "biz@startup.com", phone: "010-1414-1414" },
        { id: 26, name: "사업기획", dept: "DP11", deptName: "사업본부", position: "과장", email: "biz_staff@startup.com", phone: "010-1414-1415" },
        { id: 27, name: "R&D본부장", dept: "DP6", deptName: "R&D 본부", position: "이사", email: "rnd@startup.com", phone: "010-1515-1515" },
        { id: 28, name: "R&D기획", dept: "DP6", deptName: "R&D 본부", position: "차장", email: "rnd_staff@startup.com", phone: "010-1515-1516" },
        { id: 29, name: "경영지원본부장", dept: "DP2", deptName: "경영지원본부", position: "이사", email: "mgmt@startup.com", phone: "010-1616-1616" },
        { id: 30, name: "경영지원", dept: "DP2", deptName: "경영지원본부", position: "차장", email: "mgmt_staff@startup.com", phone: "010-1616-1617" },
        { id: 31, name: "감사", dept: "DP1", deptName: "스타트업", position: "이사", email: "audit@startup.com", phone: "010-1717-1717" },
        { id: 32, name: "법무", dept: "DP1", deptName: "스타트업", position: "부장", email: "legal@startup.com", phone: "010-1717-1718" },
        ];
    return employees.filter(
      (e) => e.dept?.toString().trim().toUpperCase() === deptCode?.toString().trim().toUpperCase()
    );
  }
},


    // 직원 정보 조회
    getEmployeeDatail: async(employeeId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/employees/${employeeId}`);
            return res.data;
        } catch (err) {
            console.warn("서버요청 실패 후 더미데이터로 대체");
        
        return null;
    }

}
};