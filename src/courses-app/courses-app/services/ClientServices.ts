import { type AuthUser } from 'wasp/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRedirectHomeUnlessUserIsAdmin({ user }: { user: AuthUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isAdmin) {
      navigate('/');
    }
  }, [user, history]);
}

/**
 * Redirects to 404 page if a required parameter is missing
 * 
 * @param params The parameters object
 * @param paramName The name of the parameter to check
 * @param path The path to redirect to if the parameter is missing
*/
export function useRedirect404IfMissingParams({
  params,
  paramName,
  path
}: { params: any, paramName: string, path?: string }) {
  const navigate = useNavigate();

  if (!params[paramName]) {
    navigate(path || '*');
  }
}
