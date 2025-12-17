import { useEffect } from 'react';

/**
 * Custom hook to set document title
 * Updates the browser tab title dynamically
 * 
 * @param {string} title - The title to set
 * @param {boolean} keepOnUnmount - Whether to keep the title when component unmounts
 * 
 * @example
 * const MyPage = () => {
 *   useDocumentTitle('My Page - Gig Connect');
 *   return <div>Page content</div>;
 * };
 */
export const useDocumentTitle = (title, keepOnUnmount = false) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      if (!keepOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, keepOnUnmount]);
};

export default useDocumentTitle;
