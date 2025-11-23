import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axios from 'axios'; // or your API client

const EnhancedPageWrapper = ({ children, titleResolver }) => {
  const [dynamicTitle, setDynamicTitle] = useState('Loading...');
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    if (titleResolver) {
      titleResolver(params).then(title => {
        setDynamicTitle(title);
      }).catch(() => {
        setDynamicTitle('Page');
      });
    }
  }, [params, titleResolver]);

  useDocumentTitle(titleResolver ? dynamicTitle : 'Page');
  
  return <>{children}</>;
};

export default EnhancedPageWrapper