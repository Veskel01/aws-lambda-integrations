import { APIGatewayProxyEvent } from 'aws-lambda';
import Cookies from 'universal-cookie';

const cookiesExtractor = (
  event: APIGatewayProxyEvent,
  cookieName: string,
): string | undefined => {
  const { Cookie: requestCookies } = event.headers as { Cookie: string };

  const parsedCookies = new Cookies(requestCookies);

  return parsedCookies.get(cookieName);
};

export default cookiesExtractor;
