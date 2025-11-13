// OrganizationTree
// 조직도 - 좌측 부서 컴포넌트
// - 조직도 모달 왼쪽 영역에 표시되는 부서 구조
// - 공통코드 (CommonCode)에서 부서 목록을 불러와 트리 형태로 렌더링
// - 선택된 부서 코드를 부모 컴포넌트로 전달 (setSelectedDept)

import { useEffect, useState } from "react"; // useState - 부서목록 저장용 state
import { organizationAPI } from "../api/organizationApi";

// MUI TreeView
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";  // MUI에서 제공하는 트리 컴포넌트 (폴더 구조처럼 보이게)
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import FolderSharedIcon from '@mui/icons-material/FolderShared';


// 아이콘
import SvgIcon from '@mui/material/SvgIcon';

// +, -, X 아이콘을 SVG로 직접 정의 (MUI 템플릿 아이콘)
function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <FolderSharedIcon/>
  );
}

// TreeItem의 기본 스타일 
const TransitionComponent = (props) => <Collapse {...props} />; // Collapse - 요소를 부드럽게 열고 닫는 애니메이션 컴포넌트
const StyledTreeItem = styled((props) => (
  <TreeItem {...props} slots={{ groupTransition: TransitionComponent }} />
))(({ theme }) => ({  // theme - MUI전역 스타일 시스템.
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': { opacity: 0.3 },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 20,
    borderLeft: `1px dashed ${theme.palette.text.disabled}`,
  },
}));

// 컴포넌트
export default function OrganizationTree({ setSelectedDept }) {
  const [departments, setDepartments] = useState([]);

  // 1. 부서 데이터 로드
  useEffect(() => {
    organizationAPI
      .getDepartments()
      .then((data) => setDepartments(data || []))
      .catch((err) => console.error("부서 가져오기 실패", err));
  }, []);

  // 2. 부서 클릭 시 선택 이벤트 처리 (트리에서 항목이 선택될 떄 실행.)
  const handleSelect = (event, itemIds) => {
    const selectedId = Array.isArray(itemIds) ? itemIds[0] : itemIds;

    if (!selectedId) {
      setSelectedDept(null);
      return;
    }

    // 선택된 부서를 찾는 부분.
    const selectedDept = departments.find(
      (dept) => String(dept.commonCodeId) === selectedId
    );

    if (selectedDept) {
      setSelectedDept(selectedDept); // 부모컴포넌트(Modal)에서 전달된 props 함수
    } else {
      console.warn("선택된 ID에 해당하는 부서를 찾을 수 없음:", selectedId);
      setSelectedDept(null);
    }
  };

  // 3. 트리 구조 렌더링 
  const renderTree = (parentCode) => {
    // 현재 parentCode를 부모로 갖는 자식 부서 필터링
    const children = departments.filter((d) => (d.value2 ?? null) === parentCode);
    if (children.length === 0) return null; // 재귀함수의 종료 조건

    return children.map((child) => (
      <StyledTreeItem
        key={child.commonCodeId}
        itemId={String(child.commonCodeId)}
        label={child.value1} // 트리에 표시할 이름
      >
        {renderTree(child.code)}
      </StyledTreeItem>
    ));
  };

  // 4. 최상위 부서
  const roots = departments.filter((d) => (d.value2 ?? null) === null);
  if(roots.length === 0) return null;

  // 5. 트리 렌더링
  return (
    <SimpleTreeView
      slots={{
        collapseIcon: MinusSquare,
        expandIcon: PlusSquare,
        endIcon: CloseSquare
      }}
      defaultExpandedItems={[roots[0]?.code]}  // 초기 상태
      onSelectedItemsChange={handleSelect}     // 클릭 시 선택 이벤트
      sx={{ height: "100%", flexGrow: 1 }}
    >
      {roots.map((root) => (
        <StyledTreeItem
          key={root.commonCodeId}     // React가 각 노드를 식별하기 위한 고유 키
          itemId={String(root.commonCodeId)}  // 트리 내부에서 식별할 ID (클릭/선택 이벤트)
          label={root.value1} // 트리에 표시할 텍스트 (부서 이름)
        >
          {renderTree(root.code)}
        </StyledTreeItem>
      ))}
    </SimpleTreeView>
  );

}