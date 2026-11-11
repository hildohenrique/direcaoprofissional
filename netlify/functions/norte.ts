import { responderNorte } from '../../servidor/norte';

/* O mentor Norte na Netlify. Precisa da variável ANTHROPIC_API_KEY no painel do site. */
export default (req: Request) => responderNorte(req);

export const config = { path: '/api/norte' };
