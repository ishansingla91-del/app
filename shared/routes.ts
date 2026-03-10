import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertFocusSessionSchema, focusSessions,
  insertChallengeSchema, challenges,
  insertUserChallengeSchema, userChallenges,
  insertFocusRoomSchema, focusRooms,
  insertRoomParticipantSchema, roomParticipants,
  insertSettingsSchema, settings
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    leaderboard: {
      method: 'GET' as const,
      path: '/api/users/leaderboard' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    }
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/users/:userId/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof focusSessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertFocusSessionSchema,
      responses: {
        201: z.custom<typeof focusSessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sessions/:id' as const,
      input: insertFocusSessionSchema.partial(),
      responses: {
        200: z.custom<typeof focusSessions.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    }
  },
  challenges: {
    list: {
      method: 'GET' as const,
      path: '/api/challenges' as const,
      responses: {
        200: z.array(z.custom<typeof challenges.$inferSelect>()),
      }
    }
  },
  userChallenges: {
    list: {
      method: 'GET' as const,
      path: '/api/users/:userId/challenges' as const,
      responses: {
        200: z.array(z.custom<typeof userChallenges.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/users/:userId/challenges' as const,
      input: insertUserChallengeSchema,
      responses: {
        201: z.custom<typeof userChallenges.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/user-challenges/:id' as const,
      input: insertUserChallengeSchema.partial(),
      responses: {
        200: z.custom<typeof userChallenges.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    }
  },
  rooms: {
    list: {
      method: 'GET' as const,
      path: '/api/rooms' as const,
      responses: {
        200: z.array(z.custom<typeof focusRooms.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/rooms' as const,
      input: insertFocusRoomSchema,
      responses: {
        201: z.custom<typeof focusRooms.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    join: {
      method: 'POST' as const,
      path: '/api/rooms/:id/join' as const,
      input: insertRoomParticipantSchema,
      responses: {
        201: z.custom<typeof roomParticipants.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    leave: {
      method: 'POST' as const,
      path: '/api/rooms/:id/leave' as const,
      input: z.object({ userId: z.number() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      }
    }
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:userId/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:userId/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
