/**
 * Vite의 `import.meta.glob`을 사용하여
 * /src/features/ 하위의 모든 .jsx 파일을 동적으로 찾음.
 */
const modules = import.meta.glob('/src/features/**/*.jsx');

/**
 * DB에서 받은 경로 문자열을 기반으로 실제 컴포넌트를 import하는 함수를 반환.
 * @param {string} path - DB (value1)에 저장된 컴포넌트 경로 (예: "features/code/pages/CodePage")
 * @returns {Function} - 해당 컴포넌트를 lazy-load하는 import 함수
 */
export const componentMapper = (path) => {
  const key = `/src/${path}.jsx`;

  if (modules[key]) {
    return modules[key];
  } else {
    console.error(`[componentMapper] Error: 컴포넌트를 찾지 못함: ${path}`);
    return () =>
      Promise.resolve({
        default: () => <div>컴포넌트를 찾지 못함: {path}</div>
      });
  }
};