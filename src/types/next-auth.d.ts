import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      company?: string
      services?: string
      subscriptionType: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    company?: string
    services?: string
    subscriptionType: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    subscriptionType: string
    company?: string
    services?: string
  }
}
