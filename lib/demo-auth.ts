/**
 * Demo login credentials (assessment / demo only — not production auth).
 * Passwords are stored in env so you can override on Vercel without code changes.
 */
export interface DemoCredential {
  email: string;
  password: string;
  label: string;
}

const DEFAULT_CREDENTIALS: DemoCredential[] = [
  {
    email: 'admin@desertcrown.ae',
    password: 'Desert@2024',
    label: 'Desert Crown Admin',
  },
  {
    email: 'manager@desertcrown.ae',
    password: 'Manager@2024',
    label: 'Desert Crown Manager',
  },
  {
    email: 'admin@marinavista.ae',
    password: 'Marina@2024',
    label: 'Marina Vista Admin',
  },
  {
    email: 'agent@marinavista.ae',
    password: 'Agent@2024',
    label: 'Marina Vista Agent',
  },
];

function credentialsFromEnv(): DemoCredential[] {
  const raw = process.env.DEMO_LOGIN_JSON;
  if (!raw) return DEFAULT_CREDENTIALS;
  try {
    return JSON.parse(raw) as DemoCredential[];
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function getDemoCredentials(): DemoCredential[] {
  return credentialsFromEnv();
}

export function verifyDemoPassword(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase();
  return credentialsFromEnv().some(
    (c) => c.email.toLowerCase() === normalized && c.password === password,
  );
}
