export interface PublicRoute {
  path: string;
  methods: string[];
  exact?: boolean;
}

export const publicRoutes: PublicRoute[] = [
  { path: "/health", methods: ["GET"], exact: true },
  { path: "/api/users/login", methods: ["POST"], exact: true },
  { path: "/api/users/register", methods: ["POST"], exact: true },
  { path: "/api/events", methods: ["GET"], exact: false },
];

export function isPublicRoute(url: string, method: string): boolean {
  return publicRoutes.some((route) => {
    const pathMatch = route.exact ? url === route.path : url.startsWith(route.path);
    return pathMatch && route.methods.includes(method);
  });
}
